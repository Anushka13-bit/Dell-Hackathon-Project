-- Enable RLS on all tables
ALTER TABLE public.problem_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- 1. problem_statements
-- Anyone can view
CREATE POLICY "Public profiles are viewable by everyone" ON public.problem_statements
  FOR SELECT USING (true);

-- Only organizers can modify
CREATE POLICY "Organizers can insert problem statements" ON public.problem_statements
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can update problem statements" ON public.problem_statements
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can delete problem statements" ON public.problem_statements
  FOR DELETE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');


-- 2. participants
-- Authenticated users can view participants
CREATE POLICY "Authenticated users can view participants" ON public.participants
  FOR SELECT USING (auth.role() = 'authenticated');

-- Organizers can insert/update participants
CREATE POLICY "Organizers can insert participants" ON public.participants
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can update participants" ON public.participants
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

-- Allow users to edit their own participant record (if id matches auth.uid)
CREATE POLICY "Users can update their own participant record" ON public.participants
  FOR UPDATE USING (auth.uid()::text = id);


-- 3. teams
-- Authenticated users can view teams
CREATE POLICY "Authenticated users can view teams" ON public.teams
  FOR SELECT USING (auth.role() = 'authenticated');

-- Organizers can insert/update teams
CREATE POLICY "Organizers can insert teams" ON public.teams
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can update teams" ON public.teams
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');


-- 4. idea_submissions
-- Organizers can view all submissions
CREATE POLICY "Organizers can view all idea submissions" ON public.idea_submissions
  FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

-- Organizers can insert/update submissions
CREATE POLICY "Organizers can insert idea submissions" ON public.idea_submissions
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can update idea submissions" ON public.idea_submissions
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');


-- 5. reviewers
-- Only organizers can view/modify reviewers
CREATE POLICY "Organizers can view reviewers" ON public.reviewers
  FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can insert reviewers" ON public.reviewers
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can update reviewers" ON public.reviewers
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can delete reviewers" ON public.reviewers
  FOR DELETE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');


-- 6. assignments
-- Only organizers can view/modify assignments
CREATE POLICY "Organizers can view assignments" ON public.assignments
  FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can insert assignments" ON public.assignments
  FOR INSERT WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can update assignments" ON public.assignments
  FOR UPDATE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');

CREATE POLICY "Organizers can delete assignments" ON public.assignments
  FOR DELETE USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'organizer');
