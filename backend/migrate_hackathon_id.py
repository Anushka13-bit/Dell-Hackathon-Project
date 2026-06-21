import os
import psycopg2
from dotenv import load_dotenv

load_dotenv('../frontend/.env.local')
db_url = os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
# Assuming SUPABASE_SERVICE_ROLE_KEY or database URL
# Let's check what env vars we have
