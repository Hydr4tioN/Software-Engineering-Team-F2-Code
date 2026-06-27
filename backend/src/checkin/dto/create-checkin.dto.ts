export class CreateCheckinDto {
  user_id?: string;      // <--- ADD THIS LINE!
  stressLevel?: number;
  category?: string;
  note?: string;
  energyLevel?: number;
}   
