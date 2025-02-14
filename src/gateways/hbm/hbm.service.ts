import { Injectable } from '@nestjs/common';
import { HeartbeatMeasurement, Irregularity } from './types/heartbeat.types';

@Injectable()
export class HbmService {
  private measurements: HeartbeatMeasurement[] = [];
  private irregularities: Irregularity[] = [];
  private readonly THRESHOLD = 0.2; // 20% de variação permitida
  private readonly WINDOW_SIZE = 60; // Últimas 60 medições
  private readonly MIN_IRREGULAR = 5; // 5 medições irregulares para detectar anomalia
  private readonly INTERVALO_MEDICAO = 100;

  processMeasurement(measurement: HeartbeatMeasurement): string | null {
    this.measurements.push(measurement);

    // Mantém apenas as últimas 60 medições
    if (this.measurements.length > this.WINDOW_SIZE) {
      this.measurements.shift();
    }

    return this.detectIrregularities();
  }

  private detectIrregularities(): string | null {
    if (this.measurements.length < this.WINDOW_SIZE) return null;

    const baseline = this.calculateBaseline();
    const irregularMeasurements = this.measurements.filter(
      (m) => Math.abs(m.voltage - baseline) / baseline >= this.THRESHOLD,
    );
    const irregularCount = irregularMeasurements.length;

    if (irregularCount >= this.MIN_IRREGULAR) {
      this.registerIrregularity(irregularMeasurements);
      return 'bip';
    }

    // Se não há irregularidades por 60 medições após um bip, normalizamos
    if (this.irregularities.length > 0) {
      const lastIrregularity =
        this.irregularities[this.irregularities.length - 1];
      if (
        !lastIrregularity.endTime &&
        irregularCount === 0 &&
        Date.now() - lastIrregularity.startTime >=
          this.WINDOW_SIZE * this.INTERVALO_MEDICAO
      ) {
        lastIrregularity.endTime = Date.now();
        return 'bipbip';
      }
    }

    return null;
  }

  /**
   * Calcula o baseline com a média dos últimos 60 valores
   */
  private calculateBaseline(): number {
    const sum = this.measurements.reduce((acc, m) => acc + m.voltage, 0);
    return sum / this.measurements.length;
  }

  private registerIrregularity(
    irregularMeasurements: HeartbeatMeasurement[],
  ): void {
    const now = Date.now();
    this.irregularities.push({
      startTime: now,
      measurements: irregularMeasurements,
    });
  }

  getIrregularities(): Irregularity[] {
    return this.irregularities;
  }
}
