import { NextResponse } from 'next/server';
import { submitRegistration } from '@/app/actions/registration';

export async function GET() {
  const payload = {
    name: 'Test Anushka',
    email: 'anushka@test.com',
    college: 'Test College',
    github: 'anushka',
    gender: 'Female',
    skills: ['React'],
    raw_text: 'Test resume text'
  };
  
  try {
    const result = await submitRegistration(payload);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
