-- Create enum for user roles
CREATE TYPE user_role AS ENUM ('student', 'class_teacher', 'faculty', 'hod', 'coe');

-- Create enum for application types
CREATE TYPE application_type AS ENUM ('retest', 'improvement');

-- Create enum for application status  
CREATE TYPE application_status AS ENUM ('pending', 'approved_by_class_teacher', 'approved_by_faculty', 'approved_by_hod', 'approved_by_coe', 'rejected');

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  department TEXT,
  semester INTEGER,
  section TEXT,
  roll_number TEXT,
  is_first_login BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create courses table for class teacher course management
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code TEXT NOT NULL,
  course_name TEXT NOT NULL,
  faculty_email TEXT NOT NULL,
  department TEXT NOT NULL,
  semester INTEGER NOT NULL,
  section TEXT NOT NULL,
  class_teacher_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(course_code, department, semester, section)
);

-- Create applications table for retest/improvement requests
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  application_type application_type NOT NULL,
  reason TEXT NOT NULL,
  status application_status DEFAULT 'pending',
  class_teacher_approved_at TIMESTAMP WITH TIME ZONE,
  faculty_approved_at TIMESTAMP WITH TIME ZONE,
  hod_approved_at TIMESTAMP WITH TIME ZONE,
  coe_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for courses
CREATE POLICY "Class teachers can manage their courses" 
ON public.courses FOR ALL 
USING (auth.uid() = class_teacher_id);

CREATE POLICY "Students can view courses for their dept/semester/section" 
ON public.courses FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'student'
    AND department = courses.department 
    AND semester = courses.semester 
    AND section = courses.section
  )
);

-- RLS Policies for applications
CREATE POLICY "Students can manage their own applications" 
ON public.applications FOR ALL 
USING (auth.uid() = student_id);

CREATE POLICY "Class teachers can view applications for their students" 
ON public.applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE c.id = applications.course_id 
    AND c.class_teacher_id = auth.uid()
    AND p.role = 'class_teacher'
  )
);

CREATE POLICY "Faculty can view applications for their courses" 
ON public.applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE c.id = applications.course_id 
    AND c.faculty_email = p.email
    AND p.role = 'faculty'
  )
);

CREATE POLICY "HOD can view applications in their department" 
ON public.applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses c
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE c.id = applications.course_id 
    AND c.department = p.department
    AND p.role = 'hod'
  )
);

CREATE POLICY "COE can view all applications" 
ON public.applications FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() AND p.role = 'coe'
  )
);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    'student'::user_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses  
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();