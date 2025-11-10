export interface CreateVisitDto {
  fingerprint: string;
  path: string;
}

export interface StartSessionDto {
  sessionId: string;
  fingerprint: string;
}

export interface HeartbeatDto {
  sessionId: string;
}

export interface VisitResponse {
  _id: string;
  fingerprint: string;
  path: string;
  day: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionResponse {
  _id: string;
  sessionId: string;
  fingerprint: string;
  startTime: string;
  lastSeenAt: string;
  durationInSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface HeartbeatResponse {
  status: "received" | "ok" | string;
}
