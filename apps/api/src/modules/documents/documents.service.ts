import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { StorageService } from '../../common/storage/storage.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { StatutDocument } from '@prisma/client';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(
    organisationId: string,
    params: {
      page?: number;
      limit?: number;
      categorie?: string;
      tags?: string[];
      statut?: StatutDocument;
      search?: string;
    },
  ) {
    const { page = 1, limit = 20, categorie, tags, statut, search } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { organisationId };

    if (categorie) where['categorie'] = categorie;
    if (statut) where['statut'] = statut;
    if (tags && tags.length > 0) where['tags'] = { hasSome: tags };

    if (search) {
      where['OR'] = [
        { nom: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { createur: { select: { id: true, nom: true, prenom: true } } },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string, organisationId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, organisationId },
      include: {
        createur: { select: { id: true, nom: true, prenom: true } },
        versions: { orderBy: { version: 'desc' } },
      },
    });

    if (!doc) throw new NotFoundException(`Document ${id} introuvable`);
    return doc;
  }

  async upload(
    organisationId: string,
    userId: string,
    file: Express.Multer.File,
    dto: UploadDocumentDto,
  ) {
    if (!file) throw new BadRequestException('Aucun fichier fourni');

    const fichierUrl = await this.storage.uploadFile(file, `documents/${organisationId}`);

    return this.prisma.document.create({
      data: {
        organisationId,
        createurId: userId,
        nom: dto.nom ?? file.originalname,
        description: dto.description,
        categorie: dto.categorie,
        tags: dto.tags ?? [],
        statut: dto.statut ?? StatutDocument.VALIDE,
        fichierUrl,
        fichierNom: file.originalname,
        fichierTaille: file.size,
        mimeType: file.mimetype,
        documentParentId: dto.documentParentId,
        dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : undefined,
      },
    });
  }

  async update(id: string, organisationId: string, dto: UpdateDocumentDto) {
    await this.findOne(id, organisationId);

    return this.prisma.document.update({
      where: { id },
      data: {
        ...dto,
        dateExpiration: dto.dateExpiration ? new Date(dto.dateExpiration) : undefined,
      },
    });
  }

  async delete(id: string, organisationId: string) {
    const doc = await this.findOne(id, organisationId);

    await this.storage.deleteFile(doc.fichierUrl);
    await this.prisma.document.delete({ where: { id } });

    return { message: 'Document supprimé avec succès' };
  }

  async getSignedUrl(id: string, organisationId: string) {
    const doc = await this.findOne(id, organisationId);

    const endpoint = doc.fichierUrl;
    const urlParts = endpoint.split('/');
    const bucket = urlParts[urlParts.length - 2];
    const key = urlParts.slice(urlParts.length - 1).join('/');

    const signedUrl = await this.storage.getSignedUrl(
      `documents/${organisationId}/${key}`,
      3600,
    );

    return { signedUrl, expiresIn: 3600, nom: doc.fichierNom };
  }

  async archiverDocument(id: string, organisationId: string) {
    await this.findOne(id, organisationId);
    return this.prisma.document.update({
      where: { id },
      data: { statut: StatutDocument.ARCHIVE },
    });
  }

  async getQrCode(id: string, organisationId: string, baseUrl: string): Promise<string> {
    const doc = await this.findOne(id, organisationId);
    const verificationUrl = `${baseUrl}/documents/verifier/${id}`;
    // Encode sous forme de data URI Google Charts QR (pas de dépendance externe)
    const encoded = encodeURIComponent(verificationUrl);
    return {
      url: verificationUrl,
      qrImageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encoded}`,
      document: { id: doc.id, nom: doc.nom, fichierNom: doc.fichierNom },
    } as any;
  }

  async verifierDocument(id: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id },
      include: {
        createur: { select: { nom: true, prenom: true } },
        organisation: { select: { nom: true } },
      },
    });
    if (!doc) return { valide: false, message: 'Document introuvable ou supprimé' };
    return {
      valide: true,
      document: {
        id: doc.id,
        nom: doc.nom,
        organisation: (doc as any).organisation?.nom,
        uploadePar: `${(doc as any).createur?.prenom ?? ''} ${(doc as any).createur?.nom ?? ''}`.trim(),
        dateUpload: doc.createdAt,
        statut: doc.statut,
      },
    };
  }
}
