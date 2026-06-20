-- 1. Create a secure user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Only let users read their own role (optional, but good practice)
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- 2. Create a function and trigger to automatically populate user_roles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER AS $$
BEGIN
    IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (new.id, new.raw_user_meta_data->>'role');
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;

CREATE TRIGGER on_auth_user_created_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- 3. Backfill existing users into user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, raw_user_meta_data->>'role'
FROM auth.users
WHERE raw_user_meta_data->>'role' IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 4. Replace all insecure policies on problem_statements
DROP POLICY IF EXISTS "Organizers can insert problem statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Organizers can update problem statements" ON public.problem_statements;
DROP POLICY IF EXISTS "Organizers can delete problem statements" ON public.problem_statements;

CREATE POLICY "Organizers can insert problem statements" ON public.problem_statements
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can update problem statements" ON public.problem_statements
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can delete problem statements" ON public.problem_statements
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));

-- 5. Replace all insecure policies on participants
DROP POLICY IF EXISTS "Organizers can insert participants" ON public.participants;
DROP POLICY IF EXISTS "Organizers can update participants" ON public.participants;

CREATE POLICY "Organizers can insert participants" ON public.participants
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can update participants" ON public.participants
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));

-- 6. Replace all insecure policies on teams
DROP POLICY IF EXISTS "Organizers can insert teams" ON public.teams;
DROP POLICY IF EXISTS "Organizers can update teams" ON public.teams;

CREATE POLICY "Organizers can insert teams" ON public.teams
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can update teams" ON public.teams
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));

-- 7. Replace all insecure policies on idea_submissions
DROP POLICY IF EXISTS "Organizers can view all idea submissions" ON public.idea_submissions;
DROP POLICY IF EXISTS "Organizers can insert idea submissions" ON public.idea_submissions;
DROP POLICY IF EXISTS "Organizers can update idea submissions" ON public.idea_submissions;

CREATE POLICY "Organizers can view all idea submissions" ON public.idea_submissions
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can insert idea submissions" ON public.idea_submissions
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can update idea submissions" ON public.idea_submissions
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));

-- 8. Replace all insecure policies on reviewers
DROP POLICY IF EXISTS "Organizers can view reviewers" ON public.reviewers;
DROP POLICY IF EXISTS "Organizers can insert reviewers" ON public.reviewers;
DROP POLICY IF EXISTS "Organizers can update reviewers" ON public.reviewers;
DROP POLICY IF EXISTS "Organizers can delete reviewers" ON public.reviewers;

CREATE POLICY "Organizers can view reviewers" ON public.reviewers
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can insert reviewers" ON public.reviewers
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can update reviewers" ON public.reviewers
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can delete reviewers" ON public.reviewers
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));

-- 9. Replace all insecure policies on assignments
DROP POLICY IF EXISTS "Organizers can view assignments" ON public.assignments;
DROP POLICY IF EXISTS "Organizers can insert assignments" ON public.assignments;
DROP POLICY IF EXISTS "Organizers can update assignments" ON public.assignments;
DROP POLICY IF EXISTS "Organizers can delete assignments" ON public.assignments;

CREATE POLICY "Organizers can view assignments" ON public.assignments
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can insert assignments" ON public.assignments
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can update assignments" ON public.assignments
  FOR UPDATE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
CREATE POLICY "Organizers can delete assignments" ON public.assignments
  FOR DELETE USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'organizer'));
