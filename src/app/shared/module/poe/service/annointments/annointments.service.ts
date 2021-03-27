import { Injectable } from '@angular/core'
import { AnnointmentsProvider } from '../../provider/annointments.provider'

@Injectable({
  providedIn: 'root',
})
export class AnnointmentsService {
  constructor(private readonly annointmentsProvider: AnnointmentsProvider) {}

  public get(annointmentId: string): string[] {
    const annointmentsMap = this.annointmentsProvider.provide()

    const annointment = annointmentsMap[annointmentId]
    if (!annointment) {
      return undefined
    }

    return annointment
  }
}
