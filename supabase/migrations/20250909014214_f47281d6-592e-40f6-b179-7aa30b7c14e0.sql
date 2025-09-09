-- Fix RLS policies for profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Add authentication-required policies for profiles
CREATE POLICY "Authenticated users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Fix RLS policies for courses table
DROP POLICY IF EXISTS "Faculty can view their courses" ON public.courses;
DROP POLICY IF EXISTS "Faculty can manage their courses" ON public.courses;
DROP POLICY IF EXISTS "Students can view courses" ON public.courses;

-- Add authentication-required policies for courses
CREATE POLICY "Authenticated faculty can view their courses" 
ON public.courses 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('faculty', 'class-teacher', 'hod', 'coe')
  )
);

CREATE POLICY "Authenticated faculty can manage their courses" 
ON public.courses 
FOR ALL 
TO authenticated
USING (
  created_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('faculty', 'class-teacher', 'hod', 'coe')
  )
);

CREATE POLICY "Authenticated students can view courses" 
ON public.courses 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'student'
  )
);

-- Fix RLS policies for applications table
DROP POLICY IF EXISTS "Students can view their own applications" ON public.applications;
DROP POLICY IF EXISTS "Students can create applications" ON public.applications;
DROP POLICY IF EXISTS "Students can update their own applications" ON public.applications;
DROP POLICY IF EXISTS "Faculty can view applications in their department" ON public.applications;
DROP POLICY IF EXISTS "Faculty can update applications" ON public.applications;

-- Add authentication-required policies for applications
CREATE POLICY "Authenticated students can view their own applications" 
ON public.applications 
FOR SELECT 
TO authenticated
USING (
  student_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'student'
  )
);

CREATE POLICY "Authenticated students can create applications" 
ON public.applications 
FOR INSERT 
TO authenticated
WITH CHECK (
  student_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'student'
  )
);

CREATE POLICY "Authenticated students can update their own applications" 
ON public.applications 
FOR UPDATE 
TO authenticated
USING (
  student_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'student'
  )
);

CREATE POLICY "Authenticated faculty can view applications in their department" 
ON public.applications 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('faculty', 'class-teacher', 'hod', 'coe')
  )
);

CREATE POLICY "Authenticated faculty can update applications" 
ON public.applications 
FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('faculty', 'class-teacher', 'hod', 'coe')
  )
);