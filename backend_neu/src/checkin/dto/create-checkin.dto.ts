// user_id wird bewusst NICHT vom Client angenommen – sie kommt aus dem Login-Token.
export class CreateCheckinDto {
  stressLevel?: number;
  category?: string;
  note?: string;
  energyLevel?: number;
}
