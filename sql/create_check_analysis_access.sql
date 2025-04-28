-- פונקציה הבודקת אם למשתמש יש הרשאת גישה לניתוח מסוים

CREATE OR REPLACE FUNCTION public.check_analysis_access(
  analysis_id UUID, 
  auth_token TEXT
) 
RETURNS BOOLEAN 
LANGUAGE plpgsql SECURITY DEFINER 
AS $$
DECLARE
  requesting_user_id UUID;
  analysis_owner_id UUID;
  company_id UUID;
  user_belongs_to_company BOOLEAN;
BEGIN
  -- קבלת מזהה המשתמש מטוקן האימות
  requesting_user_id := (SELECT auth.uid() FROM auth.uid());
  
  IF requesting_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- בדיקה אם הניתוח שייך למשתמש
  SELECT ca.user_id, ca.company_id
  INTO analysis_owner_id, company_id
  FROM call_analyses ca
  WHERE ca.id = analysis_id;
  
  -- אם הניתוח שייך ישירות למשתמש, אישור הגישה
  IF analysis_owner_id = requesting_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- בדיקה אם המשתמש שייך לחברה של הניתוח
  IF company_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 
      FROM user_companies uc
      WHERE uc.company_id = company_id 
      AND uc.user_id = requesting_user_id
    ) INTO user_belongs_to_company;
    
    IF user_belongs_to_company THEN
      RETURN TRUE;
    END IF;
  END IF;
  
  -- אם המשתמש הוא מנהל מערכת, אישור גישה
  IF EXISTS(
    SELECT 1 
    FROM users u
    WHERE u.id = requesting_user_id 
    AND u.is_admin = TRUE
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- אם לא התקיים אף תנאי, אין אישור גישה
  RETURN FALSE;
END;
$$; 