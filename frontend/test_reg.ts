import { submitRegistration } from './src/app/actions/registration';

async function main() {
  const payload = {
    name: 'Test Badmos',
    email: 'badmos@gmail.com',
    college: 'Test College',
    github: 'test',
    gender: 'Male',
    skills: ['React'],
    raw_text: 'Test resume text'
  };
  const result = await submitRegistration(payload);
  console.log(result);
}
main().catch(console.error);
