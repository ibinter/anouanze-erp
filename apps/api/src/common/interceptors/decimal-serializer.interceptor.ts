import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * ============================================================================
 * CORRECTIF RACINE — sérialisation numérique des réponses API (tout l'ERP)
 * ----------------------------------------------------------------------------
 * Prisma renvoie les champs `Decimal` (montants, soldes, débits, salaires…)
 * sous forme d'OBJETS Decimal qui se sérialisent en CHAÎNES JSON ("22000000").
 * Côté front, additionner ces chaînes avec `+` les CONCATÈNE → KPI corrompus
 * (« 22 000 000 850 000 015 000 000 »).
 *
 * Cet intercepteur global parcourt récursivement chaque réponse et convertit
 * tout Decimal (et BigInt) en `number`. Appliqué à TOUS les modules d'un coup.
 * Les Date, Buffer, null, string, boolean sont laissés intacts.
 * ============================================================================
 */
function isDecimal(v: any): boolean {
  return (
    v !== null &&
    typeof v === 'object' &&
    typeof v.toNumber === 'function' &&
    (v.constructor?.name === 'Decimal' || typeof v.d !== 'undefined')
  );
}

function convert(value: any, depth = 0): any {
  if (value === null || value === undefined) return value;
  if (depth > 50) return value; // garde-fou anti-récursion pathologique

  const t = typeof value;
  if (t === 'bigint') return Number(value);
  if (t !== 'object') return value;

  if (isDecimal(value)) {
    const n = value.toNumber();
    return Number.isFinite(n) ? n : Number(value.toString());
  }

  // Types à préserver tels quels
  if (value instanceof Date) return value;
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value;

  if (Array.isArray(value)) {
    return value.map((item) => convert(item, depth + 1));
  }

  // Objet simple : reconstruit avec les valeurs converties
  const proto = Object.getPrototypeOf(value);
  if (proto === Object.prototype || proto === null) {
    const out: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      out[key] = convert(value[key], depth + 1);
    }
    return out;
  }

  // Autres instances de classe : convertit les propriétés énumérables sans casser le prototype
  for (const key of Object.keys(value)) {
    const converted = convert(value[key], depth + 1);
    if (converted !== value[key]) value[key] = converted;
  }
  return value;
}

@Injectable()
export class DecimalSerializerInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => convert(data)));
  }
}
