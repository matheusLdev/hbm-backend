export type HeartbeatMeasurement = {
  timestamp: number;
  voltage: number;
};

export type Irregularity = {
  startTime: number;
  endTime?: number;
  measurements: HeartbeatMeasurement[];
};
