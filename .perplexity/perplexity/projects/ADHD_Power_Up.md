ADHD-Power-Up 🔋

# Project Structure

├─ 📁 supabase
  ├─ 📁 migrations
    └─ 20250903014823_new-migration.sql
  └─ config.toml
├─ 📁 database
  ├─ 📁 alembic
    └─ alembic.ini
    └─ env.py
  └─ main.py
├─ 📁 backend
  ├─ 📁 supabase
    ├─ 📁 migrations
      └─ 20250903014746_new-migration.sql
    └─ Initialize_user.ts
    └─ config.toml
    └─ main.py
    └─ seed.sql
  ├─ 📁 app
    ├─ 📁 models
      └─ user.py
      └─ session.py
      └─ __init__.py
    ├─ 📁 services
      └─ musical_dna_profile.py
      └─ rapid_prototype_engine.py
      └─ openai_service.py
      └─ multi_modal_processor.py
      └─ creation_corner_engine.py
      └─ ai_orchestrator.py
      └─ index.css
      └─ plk_service.py
      └─ huggingface_service.py
      └─ anthropic_service.py
      └─ __init__.py
    ├─ 📁 utils
      └─ auth.py
      └─ database.py
      └─ __init__.py
    └─ gestaltview-backend.py
    └─ main.py
    └─ config.py
    └─ __init__.py
  └─ Dockerfile
  └─ requirements.md
  └─ backend.sh
  └─ env.py
  └─ requirements.txt
  └─ setup.sh
  └─ README.md
  └─ setup.py
├─ 📁 frontend
  ├─ 📁 public
    └─ index.html
  ├─ 📁 src
    ├─ 📁 styles
      └─ adhd-friendly.css
      └─ index.css
      └─ mobile-adhd.css
      └─ Keith's_Neural_Aurora_Signature_Gradient.md
    ├─ 📁 components
      └─ EnhancedWelcome.tsx
      └─ Neural-aurora-demo.js
      └─ ChatInterface.js
      └─ index.js
      └─ Header.js
      └─ ProfileDashboard.js
      └─ ConsciousnessTracker.js
      └─ LoadingSpinner.js
      └─ EnhancedMainInterface.tsx
    ├─ 📁 services
      └─ api.js
    └─ index.js
    └─ App.tsx
    └─ GlassCard.js
    └─ GlassCard.css
  └─ Dockerfile
  └─ tailwind.config.js
  └─ package.json
  └─ huggingface.py
  └─ globals.css
  └─ package-lock.json
└─ check_backend.sh
└─ docker-compose.yml
└─ backend.sh
└─ package.json
└─ setup.bat
└─ index.css
└─ LICENSE.md
└─ generate-zip.py
└─ supabase.sh
└─ App.tsx.txt
└─ package-lock.json


# Project Files

- supabase/config.toml
- supabase/migrations/20250903014823_new-migration.sql
- database/main.py
- database/alembic/alembic.ini
- database/alembic/env.py
- backend/supabase/Initialize_user.ts
- backend/supabase/config.toml
- backend/supabase/main.py
- backend/supabase/migrations/20250903014746_new-migration.sql
- backend/supabase/seed.sql
- backend/Dockerfile
- backend/requirements.md
- backend/backend.sh
- backend/app/gestaltview-backend.py
- backend/app/main.py
- backend/app/config.py
- backend/app/__init__.py
- backend/app/models/user.py
- backend/app/models/session.py
- backend/app/models/__init__.py
- backend/app/services/creation_corner_engine.py
- backend/app/services/ai_orchestrator.py
- backend/app/services/index.css
- backend/app/services/plk_service.py
- backend/app/utils/auth.py
- backend/app/services/multi_modal_processor.py
- backend/app/services/huggingface_service.py
- backend/app/utils/database.py
- backend/app/services/anthropic_service.py
- backend/app/utils/__init__.py
- backend/app/services/__init__.py
- backend/app/services/openai_service.py
- backend/env.py
- backend/requirements.txt
- backend/setup.sh
- backend/README.md
- backend/setup.py
- check_backend.sh
- docker-compose.yml
- backend/app/services/rapid_prototype_engine.py
- backend.sh
- backend/app/services/musical_dna_profile.py
- package.json
- setup.bat
- index.css
- LICENSE.md
- generate-zip.py
- supabase.sh
- App.tsx.txt
- package-lock.json
- frontend/Dockerfile
- frontend/tailwind.config.js
- frontend/public/index.html
- frontend/package.json
- frontend/huggingface.py
- frontend/globals.css
- frontend/package-lock.json
- frontend/src/styles/adhd-friendly.css
- frontend/src/styles/index.css
- frontend/src/styles/mobile-adhd.css
- frontend/src/styles/Keith's_Neural_Aurora_Signature_Gradient.md
- frontend/src/index.js
- frontend/src/App.tsx
- frontend/src/GlassCard.js
- frontend/src/services/api.js
- frontend/src/components/EnhancedWelcome.tsx
- frontend/src/components/Neural-aurora-demo.js
- frontend/src/components/ChatInterface.js
- frontend/src/components/index.js
- frontend/src/components/Header.js
- frontend/src/components/ProfileDashboard.js
- frontend/src/components/ConsciousnessTracker.js
- frontend/src/components/LoadingSpinner.js
- frontend/src/components/EnhancedMainInterface.tsx
- frontend/src/GlassCard.css

## supabase/config.toml
```
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "AdHD-Brain"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 17

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# If disabled, migrations will be skipped during a db push or reset.
enabled = true
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[db.network_restrictions]
# Enable management of network restrictions.
enabled = false
# List of IPv4 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv4 connections. Set empty array to block all IPs.
allowed_cidrs = ["0.0.0.0/0"]
# List of IPv6 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv6 connections. Set empty array to block all IPs.
allowed_cidrs_v6 = ["::/0"]

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# Path to JWT signing key. DO NOT commit your signing keys file to git.
# signing_keys_path = "./signing_keys.json"
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
anonymous_users = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150
# Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
sign_in_sign_ups = 30
# Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
token_verifications = 30
# Number of Web3 logins that can be made in a 5 minute interval per IP address.
web3 = 30

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a new user is created and allows developers to reject the request based on the incoming user object.
# [auth.hook.before_user_created]
# enabled = true
# uri = "pg-functions://postgres/auth/before-user-created-hook"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Allow Solana wallet holders to sign in to your project via the Sign in with Solana (SIWS, EIP-4361) standard.
# You can configure "web3" rate limit in the [auth.rate_limit] section and set up [auth.captcha] if self-hosting.
[auth.web3.solana]
enabled = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

# Use Clerk as a third-party provider alongside Supabase Auth.
[auth.third_party.clerk]
enabled = false
# Obtain from https://clerk.com/setup/supabase
# domain = "example.clerk.accounts.dev"

[edge_runtime]
enabled = true
# Supported request policies: `oneshot`, `per_worker`.
# `per_worker` (default) — enables hot reload during local development.
# `oneshot` — fallback mode if hot reload causes issues (e.g. in large repos or with symlinks).
policy = "per_worker"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
# The Deno major version to use.
deno_version = 2

# [edge_runtime.secrets]
# secret_key = "env(SECRET_VALUE)"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"

```

## supabase/migrations/20250903014823_new-migration.sql
```

```

## database/main.py
```
import psycopg2
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Connect to the database
try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Connection successful!")
    
    # Create a cursor to execute SQL queries
    cursor = connection.cursor()
    
    # Example query
    cursor.execute("SELECT NOW();")
    result = cursor.fetchone()
    print("Current Time:", result)

    # Close the cursor and connection
    cursor.close()
    connection.close()
    print("Connection closed.")

except Exception as e:
    print(f"Failed to connect: {e}")

```

## database/alembic/alembic.ini
```
# A generic, single database configuration.

[alembic]
# path to migration scripts
script_location = database/alembic

# template used to generate migration file names; The default value is %%(rev)s_%%(slug)s
# Uncomment the line below if you want the files to be prepended with date and time
# file_template = %%Y%%m%%d_%%H%%M%%(rev)s_%%slug%%s

# sys.path path, will be prepended to sys.path if present.
# defaults to the current working directory.
prepend_sys_path = .

# timezone to use when rendering the date within the migration file
# as well as the filename.
# If specified, requires the python-dateutil library that can be
# installed by adding `alembic[tz]` to the pip requirements
# string value is passed to dateutil.tz.gettz()
# leave blank for localtime
# timezone =

# max length of characters to apply to the
# "slug" field
# truncate_slug_length = 40

# set to 'true' to run the environment during
# the 'revision' command, regardless of autogenerate
# revision_environment = false

# set to 'true' to allow .pyc and .pyo files without
# a source .py file to be detected as revisions in the
# versions/ directory
# sourceless = false

# version path separator; As mentioned above, this is the character used to split
# version_locations. The default within new alembic.ini files is "os", which uses
# os.pathsep. If this key is omitted entirely, it falls back to the legacy
# behavior of splitting on spaces and/or commas.
# Valid values for version_path_separator are:
#
# version_path_separator = :
# version_path_separator = ;
# version_path_separator = space
version_path_separator = os

# set to 'true' to search source files recursively
# in each "version_locations" directory
# new in Alembic version 1.10
# recursive_version_locations = false

# the output encoding used when revision files
# are written from script.py.mako
# output_encoding = utf-8

sqlalchemy.url = driver://user:pass@localhost/dbname

[post_write_hooks]
# post_write_hooks defines scripts or Python functions that are run
# on newly generated revision scripts.

# format using "black" - use the console_scripts runner, against the "black" entrypoint
# hooks = black
# black.type = console_scripts
# black.entrypoint = black
# black.options = -l 79 REVISION_SCRIPT_FILENAME

# Logging configuration
[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console
qualname =

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %%(levelname)-5.5s [%%(name)s] %%(message)s
datefmt = %%H:%%M:%%S

```

## database/alembic/env.py
```
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
from app.models import Base
from app.config import settings

# this is the Alembic Config object
config = context.config

# Set the database URL
config.set_main_option("sqlalchemy.url", settings.database_url)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

```

## backend/supabase/Initialize_user.ts
```
import { createClient } from "npm:@supabase/supabase-js@2.43.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { user_name, energy_level, context_clues } = await req.json();

  // optional auth
  const authHeader = req.headers.get("authorization");
  const userId = authHeader ? (await supabase.auth.getUser(authHeader.split(" ")[1])).data.user?.id : null;

  const sessionId = crypto.randomUUID();

  if (userId) {
    // upsert profile if needed
    await supabase.from("profiles").upsert({ id: userId });

    // insert a session row (RLS will enforce ownership)
    const { data, error } = await supabase.from("sessions").insert({
      id: sessionId,
      user_id: userId,
      consciousness_state: "focused",
      energy_level,
      context_clues,
    });

    if (error) throw error;
  }

  return new Response(
    JSON.stringify({
      session_id: sessionId,
      user_id: userId ?? `anonymous_${sessionId}`,
      user_name: user_name ?? "Friend",
      is_authenticated: !!userId,
      welcome_message: userId
        ? "Welcome back! Ready for another consciousness‑serving session?"
        : "Welcome to GestaltView! Let's explore your ADHD consciousness together.",
    }),
    { headers: { "content-type": "application/json", "access-control-allow-origin": "*" } }
  );
});

```

## backend/supabase/config.toml
```
# For detailed configuration reference documentation, visit:
# https://supabase.com/docs/guides/local-development/cli/config
# A string used to distinguish different Supabase projects on the same host. Defaults to the
# working directory name when running `supabase init`.
project_id = "backend"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API
# endpoints. `public` and `graphql_public` schemas are included by default.
schemas = ["public", "graphql_public"]
# Extra schemas to add to the search_path of every request.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size
# for accidental or malicious requests.
max_rows = 1000

[api.tls]
# Enable HTTPS endpoints locally using a self-signed certificate.
enabled = false

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW
# server_version;` on the remote database to check.
major_version = 17

[db.pooler]
enabled = false
# Port to use for the local connection pooler.
port = 54329
# Specifies when a server connection can be reused by other clients.
# Configure one of the supported pooler modes: `transaction`, `session`.
pool_mode = "transaction"
# How many server connections to allow per user/database pair.
default_pool_size = 20
# Maximum number of client connections allowed.
max_client_conn = 100

# [db.vault]
# secret_key = "env(SECRET_VALUE)"

[db.migrations]
# If disabled, migrations will be skipped during a db push or reset.
enabled = true
# Specifies an ordered list of schema files that describe your database.
# Supports glob patterns relative to supabase directory: "./schemas/*.sql"
schema_paths = []

[db.seed]
# If enabled, seeds the database after migrations during a db reset.
enabled = true
# Specifies an ordered list of seed files to load during db reset.
# Supports glob patterns relative to supabase directory: "./seeds/*.sql"
sql_paths = ["./seed.sql"]

[db.network_restrictions]
# Enable management of network restrictions.
enabled = false
# List of IPv4 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv4 connections. Set empty array to block all IPs.
allowed_cidrs = ["0.0.0.0/0"]
# List of IPv6 CIDR blocks allowed to connect to the database.
# Defaults to allow all IPv6 connections. Set empty array to block all IPs.
allowed_cidrs_v6 = ["::/0"]

[realtime]
enabled = true
# Bind realtime via either IPv4 or IPv6. (default: IPv4)
# ip_version = "IPv6"
# The maximum length in bytes of HTTP request headers. (default: 4096)
# max_header_length = 4096

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://127.0.0.1"
# OpenAI API Key to use for Supabase AI in the Supabase Studio.
openai_api_key = "env(OPENAI_API_KEY)"

# Email testing server. Emails sent with the local dev setup are not actually sent - rather, they
# are monitored, and you can view the emails that would have been sent from the web interface.
[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326
# admin_email = "admin@email.com"
# sender_name = "Admin"

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

# Image transformation API is available to Supabase Pro plan.
# [storage.image_transformation]
# enabled = true

# Uncomment to configure local storage buckets
# [storage.buckets.images]
# public = false
# file_size_limit = "50MiB"
# allowed_mime_types = ["image/png", "image/jpeg"]
# objects_path = "./images"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://127.0.0.1:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["https://127.0.0.1:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604,800 (1 week).
jwt_expiry = 3600
# Path to JWT signing key. DO NOT commit your signing keys file to git.
# signing_keys_path = "./signing_keys.json"
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true
# Allow/disallow anonymous sign-ins to your project.
enable_anonymous_sign_ins = false
# Allow/disallow testing manual linking of accounts
enable_manual_linking = false
# Passwords shorter than this value will be rejected as weak. Minimum 6, recommended 8 or more.
minimum_password_length = 6
# Passwords that do not meet the following requirements will be rejected as weak. Supported values
# are: `letters_digits`, `lower_upper_letters_digits`, `lower_upper_letters_digits_symbols`
password_requirements = ""

[auth.rate_limit]
# Number of emails that can be sent per hour. Requires auth.email.smtp to be enabled.
email_sent = 2
# Number of SMS messages that can be sent per hour. Requires auth.sms to be enabled.
sms_sent = 30
# Number of anonymous sign-ins that can be made per hour per IP address. Requires enable_anonymous_sign_ins = true.
anonymous_users = 30
# Number of sessions that can be refreshed in a 5 minute interval per IP address.
token_refresh = 150
# Number of sign up and sign-in requests that can be made in a 5 minute interval per IP address (excludes anonymous users).
sign_in_sign_ups = 30
# Number of OTP / Magic link verifications that can be made in a 5 minute interval per IP address.
token_verifications = 30
# Number of Web3 logins that can be made in a 5 minute interval per IP address.
web3 = 30

# Configure one of the supported captcha providers: `hcaptcha`, `turnstile`.
# [auth.captcha]
# enabled = true
# provider = "hcaptcha"
# secret = ""

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email
# addresses. If disabled, only the new email is required to confirm.
double_confirm_changes = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false
# If enabled, users will need to reauthenticate or have logged in recently to change their password.
secure_password_change = false
# Controls the minimum amount of time that must pass before sending another signup confirmation or password reset email.
max_frequency = "1s"
# Number of characters used in the email OTP.
otp_length = 6
# Number of seconds before the email OTP expires (defaults to 1 hour).
otp_expiry = 3600

# Use a production-ready SMTP server
# [auth.email.smtp]
# enabled = true
# host = "smtp.sendgrid.net"
# port = 587
# user = "apikey"
# pass = "env(SENDGRID_API_KEY)"
# admin_email = "admin@email.com"
# sender_name = "Admin"

# Uncomment to customize email template
# [auth.email.template.invite]
# subject = "You have been invited"
# content_path = "./supabase/templates/invite.html"

[auth.sms]
# Allow/disallow new user signups via SMS to your project.
enable_signup = false
# If enabled, users need to confirm their phone number before signing in.
enable_confirmations = false
# Template for sending OTP to users
template = "Your code is {{ .Code }}"
# Controls the minimum amount of time that must pass before sending another sms otp.
max_frequency = "5s"

# Use pre-defined map of phone number to OTP for testing.
# [auth.sms.test_otp]
# 4152127777 = "123456"

# Configure logged in session timeouts.
# [auth.sessions]
# Force log out after the specified duration.
# timebox = "24h"
# Force log out if the user has been inactive longer than the specified duration.
# inactivity_timeout = "8h"

# This hook runs before a new user is created and allows developers to reject the request based on the incoming user object.
# [auth.hook.before_user_created]
# enabled = true
# uri = "pg-functions://postgres/auth/before-user-created-hook"

# This hook runs before a token is issued and allows you to add additional claims based on the authentication method used.
# [auth.hook.custom_access_token]
# enabled = true
# uri = "pg-functions://<database>/<schema>/<hook_name>"

# Configure one of the supported SMS providers: `twilio`, `twilio_verify`, `messagebird`, `textlocal`, `vonage`.
[auth.sms.twilio]
enabled = false
account_sid = ""
message_service_sid = ""
# DO NOT commit your Twilio auth token to git. Use environment variable substitution instead:
auth_token = "env(SUPABASE_AUTH_SMS_TWILIO_AUTH_TOKEN)"

# Multi-factor-authentication is available to Supabase Pro plan.
[auth.mfa]
# Control how many MFA factors can be enrolled at once per user.
max_enrolled_factors = 10

# Control MFA via App Authenticator (TOTP)
[auth.mfa.totp]
enroll_enabled = false
verify_enabled = false

# Configure MFA via Phone Messaging
[auth.mfa.phone]
enroll_enabled = false
verify_enabled = false
otp_length = 6
template = "Your code is {{ .Code }}"
max_frequency = "5s"

# Configure MFA via WebAuthn
# [auth.mfa.web_authn]
# enroll_enabled = true
# verify_enabled = true

# Use an external OAuth provider. The full list of providers are: `apple`, `azure`, `bitbucket`,
# `discord`, `facebook`, `github`, `gitlab`, `google`, `keycloak`, `linkedin_oidc`, `notion`, `twitch`,
# `twitter`, `slack`, `spotify`, `workos`, `zoom`.
[auth.external.apple]
enabled = false
client_id = ""
# DO NOT commit your OAuth provider secret to git. Use environment variable substitution instead:
secret = "env(SUPABASE_AUTH_EXTERNAL_APPLE_SECRET)"
# Overrides the default auth redirectUrl.
redirect_uri = ""
# Overrides the default auth provider URL. Used to support self-hosted gitlab, single-tenant Azure,
# or any other third-party OIDC providers.
url = ""
# If enabled, the nonce check will be skipped. Required for local sign in with Google auth.
skip_nonce_check = false

# Allow Solana wallet holders to sign in to your project via the Sign in with Solana (SIWS, EIP-4361) standard.
# You can configure "web3" rate limit in the [auth.rate_limit] section and set up [auth.captcha] if self-hosting.
[auth.web3.solana]
enabled = false

# Use Firebase Auth as a third-party provider alongside Supabase Auth.
[auth.third_party.firebase]
enabled = false
# project_id = "my-firebase-project"

# Use Auth0 as a third-party provider alongside Supabase Auth.
[auth.third_party.auth0]
enabled = false
# tenant = "my-auth0-tenant"
# tenant_region = "us"

# Use AWS Cognito (Amplify) as a third-party provider alongside Supabase Auth.
[auth.third_party.aws_cognito]
enabled = false
# user_pool_id = "my-user-pool-id"
# user_pool_region = "us-east-1"

# Use Clerk as a third-party provider alongside Supabase Auth.
[auth.third_party.clerk]
enabled = false
# Obtain from https://clerk.com/setup/supabase
# domain = "example.clerk.accounts.dev"

[edge_runtime]
enabled = true
# Supported request policies: `oneshot`, `per_worker`.
# `per_worker` (default) — enables hot reload during local development.
# `oneshot` — fallback mode if hot reload causes issues (e.g. in large repos or with symlinks).
policy = "per_worker"
# Port to attach the Chrome inspector for debugging edge functions.
inspector_port = 8083
# The Deno major version to use.
deno_version = 2

# [edge_runtime.secrets]
# secret_key = "env(SECRET_VALUE)"

[analytics]
enabled = true
port = 54327
# Configure one of the supported backends: `postgres`, `bigquery`.
backend = "postgres"

# Experimental features may be deprecated any time
[experimental]
# Configures Postgres storage engine to use OrioleDB (S3)
orioledb_version = ""
# Configures S3 bucket URL, eg. <bucket_name>.s3-<region>.amazonaws.com
s3_host = "env(S3_HOST)"
# Configures S3 bucket region, eg. us-east-1
s3_region = "env(S3_REGION)"
# Configures AWS_ACCESS_KEY_ID for S3 bucket
s3_access_key = "env(S3_ACCESS_KEY)"
# Configures AWS_SECRET_ACCESS_KEY for S3 bucket
s3_secret_key = "env(S3_SECRET_KEY)"

```

## backend/supabase/main.py
```
from sqlalchemy import create_engine
# from sqlalchemy.pool import NullPool
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

# Fetch variables
USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

# Construct the SQLAlchemy connection string
DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)
# If using Transaction Pooler or Session Pooler, we want to ensure we disable SQLAlchemy client side pooling -
# https://docs.sqlalchemy.org/en/20/core/pooling.html#switching-pool-implementations
# engine = create_engine(DATABASE_URL, poolclass=NullPool)

# Test the connection
try:
    with engine.connect() as connection:
        print("Connection successful!")
except Exception as e:
    print(f"Failed to connect: {e}")

```

## backend/supabase/migrations/20250903014746_new-migration.sql
```

```

## backend/supabase/seed.sql
```

```

## backend/Dockerfile
```
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

```

## backend/requirements.md
```
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0

# Environment and Configuration
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database and ORM
sqlalchemy==2.0.23
asyncpg==0.29.0
alembic==1.13.1

# AI and ML Libraries
openai==1.3.5
anthropic==0.7.7
google-generativeai==0.3.1
transformers==4.35.2
torch==2.2.0

# Authentication
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# HTTP Client
httpx==0.25.2
requests==2.31.0

# Supabase Integration
supabase==2.0.3
postgrest-py==0.11.0

# Stripe Integration
stripe==7.8.0

# Data Processing
pandas==2.1.3
numpy==1.25.2

# Logging and Monitoring
loguru==0.7.2
sentry-sdk==1.38.0

# CORS and Security
python-cors==1.0.1

# Testing
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2

# Development Tools
black==23.11.0
isort==5.12.0
mypy==1.7.1

# requirements.txt
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
python-dotenv   # optional
# heavy libs
scikit-learn
pandas
librosa
opencv-python
Pillow

```

## backend/backend.sh
```
#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------
# GestaltView / Brain-Sparks Backend Setup
# ----------------------------------------
echo
echo "=== Backend Setup and Health Check ==="
echo

# 1. Check for .env
if [[ ! -f .env ]]; then
  echo "❌  .env file not found. Please create one from .env.example."
  exit 1
fi
echo "✅  .env file exists."

# 2. Load .env variables (requires `set -o allexport`)
set -o allexport
source .env
set +o allexport

# 3. Check Python and pip
if ! command -v python3 &> /dev/null; then
  echo "❌  python3 not found."
  exit 1
fi
if ! command -v pip3 &> /dev/null; then
  echo "❌  pip3 not found."
  exit 1
fi
echo "✅  python3 and pip3 are installed."

# 4. Install dependencies
if [[ -f backend/requirements.txt ]]; then
  echo "🔄  Installing Python dependencies..."
  pip3 install --upgrade pip
  pip3 install -r backend/requirements.txt
  echo "✅  Dependencies installed."
else
  echo "❌  backend/requirements.txt missing."
  exit 1
fi

# 5. Run database migrations
if [[ -f alembic.ini ]]; then
  echo "🔄  Running Alembic migrations..."
  alembic upgrade head
  echo "✅  Database migrations applied."
else
  echo "⚠️   alembic.ini not found; skipping migrations."
fi

# 6. Optional: Supabase connectivity check
if [[ -n "${SUPABASE_URL:-}" && -n "${SUPABASE_KEY:-}" ]]; then
  echo "🔄  Checking Supabase connection..."
  status=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/")
  if [[ "$status" -eq 200 ]] || [[ "$status" -eq 404 ]]; then
    echo "✅  Supabase API reachable (HTTP $status)."
  else
    echo "❌  Supabase API unreachable (HTTP $status)."
    exit 1
  fi
else
  echo "⚠️   SUPABASE_URL or SUPABASE_KEY not set; skipping Supabase check."
fi

# 7. Launch FastAPI (or your main app) in background
echo "🔄  Starting backend server..."
# Adjust the command below if you use a different entrypoint or port
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
SERVER_PID=$!
sleep 5

# 8. Health-check endpoint
echo "🔄  Performing health check on http://127.0.0.1:8000/health"
hc_status=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health)
if [[ "$hc_status" -eq 200 ]]; then
  echo "✅  Health check passed (HTTP $hc_status)."
else
  echo "❌  Health check failed (HTTP $hc_status)."
  kill $SERVER_PID
  exit 1
fi

# 9. Teardown
kill $SERVER_PID
echo
echo "🎉  Backend setup and health check completed successfully!"
echo
exit 0

```

## backend/app/gestaltview-backend.py
```
# integrated_gestaltview_backend.py
# © 2025 Keith Soyka - Full GestaltView Integration for ADHD MVP

import os
import json
import sqlite3
import logging
import uuid
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Any
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.exceptions import NotFittedError
import numpy as np
from PIL import Image
import librosa
import cv2
import random
import asyncio
import re
from enum import Enum
import pickle
import hashlib
from collections import Counter
from sqlalchemy.orm import Session
from app.models.user import User  # From your Supabase setup
import pandas as pd  # For Musical DNA CSV processing

# Logging Setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Custom Exceptions
class GestaltViewError(Exception): pass
class ValidationError(GestaltViewError): pass
class DatabaseError(GestaltViewError): pass
class ConsciousnessError(GestaltViewError): pass

# Core Enums
class CognitiveStyle(Enum):
    ADHD_COMBINED = "adhd_combined"
    CREATIVE_VISIONARY = "creative_visionary"

class SpecializedApplication(Enum):
    ADHD_POWER_UP = "adhd_power_up"
    CORE_GESTALTVIEW = "core_gestaltview"

class CreativeState(Enum):
    LIGHTNING_CAPTURE = "lightning_capture"
    PATTERN_WEAVING = "pattern_weaving"
    CREATIVE_SYNTHESIS = "creative_synthesis"

# Core Dataclasses (from your code)
@dataclass
class MetaphorDefinition:
    concept: str
    metaphor: str
    emotional_resonance: int = 8
    usage_context: str = ""

@dataclass
class EnhancedPersonalLanguageKey:
    linguistic_fingerprint: Dict[str, Any] = field(default_factory=dict)
    conversational_resonance_target: int = 95
    signature_metaphors: List[MetaphorDefinition] = field(default_factory=list)
    energy_words: List[str] = field(default_factory=list)
    trigger_words_avoid: List[str] = field(default_factory=list)
    collaborative_patterns: Dict[str, str] = field(default_factory=dict)
    contextual_metadata_history: List[Dict[str, Any]] = field(default_factory=list)
    _word_frequency: Counter = field(default_factory=Counter, init=False, repr=False)
    _phrase_frequency: Counter = field(default_factory=Counter, init=False, repr=False)
    _recent_emotional_words: Counter = field(default_factory=Counter, init=False, repr=False)

    def calculate_resonance_score(self, text: str) -> float:
        text_lower = text.lower()
        score = sum(md.emotional_resonance * 2 for md in self.signature_metaphors if md.metaphor.lower() in text_lower)
        score += sum(12 for word in self.energy_words if word.lower() in text_lower)
        score -= sum(25 for word in self.trigger_words_avoid if word.lower() in text_lower)
        if self.contextual_metadata_history:
            latest_context = self.contextual_metadata_history[-1]
            if latest_context.get("emotional_state") == "sad": score -= 10
            elif latest_context.get("emotional_state") == "happy": score += 5
        return min(100.0, max(0.0, score))

    def add_signature_metaphor(self, concept: str, metaphor: str, emotional_resonance: int, usage_context: str):
        if not any(m.metaphor.lower() == metaphor.lower() for m in self.signature_metaphors):
            self.signature_metaphors.append(MetaphorDefinition(concept, metaphor, emotional_resonance, usage_context))

    def infuse_authenticity(self, text: str) -> str:
        infused_text = text
        if self.signature_metaphors: infused_text += " (Weaving your beautiful tapestry...)"
        if self.contextual_metadata_history:
            latest_context = self.contextual_metadata_history[-1]
            if latest_context.get("emotional_state") == "sad": infused_text += " (Sending gentle support.)"
            elif latest_context.get("emotional_state") == "happy": infused_text += " (Sharing in your joy!)"
        return infused_text

    def add_contextual_metadata(self, context: Dict[str, Any]):
        context['timestamp'] = datetime.now().isoformat()
        self.contextual_metadata_history.append(context)
        self.contextual_metadata_history = self.contextual_metadata_history[-50:]

    def process_conversation(self, text: str, emotional_context: Optional[Dict[str, Any]] = None):
        words = re.findall(r'\\w+', text.lower())
        self._word_frequency.update(words)
        self.linguistic_fingerprint['most_common_words'] = [w for w, c in self._word_frequency.most_common(20)]
        if emotional_context and emotional_context.get("confidence", 0) > 0.6:
            emotion_words = [word for word in words if len(word) > 3]
            self._recent_emotional_words.update(emotion_words)
            if emotional_context.get("emotional_state") == "happy":
                for word, count in self._recent_emotional_words.most_common(5):
                    if count > 2 and word not in self.energy_words: self.energy_words.append(word)

@dataclass
class LightningBolt:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    intensity: int = 8
    plk_resonance_score: float = 0.0

@dataclass
class RapidPrototypeEngine:
    lightning_bolts: List[LightningBolt] = field(default_factory=list)
    current_state: CreativeState = CreativeState.PATTERN_WEAVING

    def capture_lightning_with_plk(self, content: str, plk: EnhancedPersonalLanguageKey, intensity: int = 8) -> str:
        bolt = LightningBolt(content=content, intensity=intensity, plk_resonance_score=plk.calculate_resonance_score(content))
        self.lightning_bolts.append(bolt)
        return bolt.id

@dataclass
class EmotionMetadata:
    dominant_emotion: str
    confidence_score: float
    energy_level: int

    def to_plk_context(self) -> Dict[str, Any]:
        return {"emotional_state": self.dominant_emotion, "energy_level": str(self.energy_level)}

class InsightFaceEmotionAnalyzer:
    def __init__(self):
        logger.info("InsightFaceEmotionAnalyzer initialized (placeholder).")

    async def analyze_emotion(self, frame: np.ndarray) -> Optional[Dict[str, Any]]:
        logger.debug("Simulating InsightFace emotion analysis.")
        if random.random() < 0.8:
            return {"emotion": random.choice(["happy", "sad", "neutral"]), "confidence": random.uniform(0.6, 0.99)}
        return None

class ConsciousnessServingEmotionEngine:
    def __init__(self, plk: EnhancedPersonalLanguageKey):
        self.plk = plk
        self.emotion_history: List[EmotionMetadata] = []
        self.analyzer = InsightFaceEmotionAnalyzer()

    async def process_live_frame(self, frame: np.ndarray) -> Optional[EmotionMetadata]:
        analysis = await self.analyzer.analyze_emotion(frame)
        if not analysis:
            return None
        metadata = EmotionMetadata(
            dominant_emotion=analysis['emotion'],
            confidence_score=analysis['confidence'],
            energy_level=random.randint(2, 9)
        )
        self.plk.add_contextual_metadata(metadata.to_plk_context())
        self.emotion_history.append(metadata)
        logger.info(f"Processed frame. Emotion: {metadata.dominant_emotion}")
        return metadata

class SymbioticFeedbackCore:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.user_history = []
        self._is_fitted = False

    def learn_from_interaction(self, text_input: str):
        if not text_input: return
        try:
            vector = self.vectorizer.transform([text_input]).toarray().flatten() # pyright: ignore[reportAttributeAccessIssue]
            self.user_history.append(vector)
        except NotFittedError:
            self.vectorizer.fit([text_input])
            self._is_fitted = True
            vector = self.vectorizer.transform([text_input]).toarray().flatten() # type: ignore
            self.user_history.append(vector)

    def predict_user_need(self, text_input: str) -> str:
        if not self._is_fitted or not self.user_history or not text_input:
            return "Share more inputs for deeper insights!"
        fused_vector = self.vectorizer.transform([text_input]).toarray() # type: ignore
        sims = cosine_similarity(fused_vector, np.array(self.user_history)).flatten()
        return f"Based on similar inputs (max similarity {np.max(sims):.2f}): Let's explore connections."

class TransparentReasoningModule:
    def __init__(self, plk: EnhancedPersonalLanguageKey):
        self.plk = plk

    def process_in_realtime(self, text: str) -> str:
        return self.plk.infuse_authenticity("Checking context...")

@dataclass
class MasterGestaltViewProfile:
    user_name: str
    profile_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    enhanced_plk: EnhancedPersonalLanguageKey = field(default_factory=EnhancedPersonalLanguageKey)
    rapid_prototype_engine: RapidPrototypeEngine = field(default_factory=RapidPrototypeEngine)
    feedback_core: SymbioticFeedbackCore = field(default_factory=SymbioticFeedbackCore)
    emotion_engine: ConsciousnessServingEmotionEngine = field(init=False)
    transparent_reasoning: TransparentReasoningModule = field(init=False)

    def __post_init__(self):
        self.emotion_engine = ConsciousnessServingEmotionEngine(self.enhanced_plk)
        self.transparent_reasoning = TransparentReasoningModule(self.enhanced_plk)

    async def process_text_input(self, text: str) -> Dict[str, Any]:
        dummy_frame = np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
        await self.emotion_engine.process_live_frame(dummy_frame)
        
        emotional_context = self.enhanced_plk.contextual_metadata_history[-1] if self.enhanced_plk.contextual_metadata_history else None
        self.enhanced_plk.process_conversation(text, emotional_context)
        
        self.feedback_core.learn_from_interaction(text)
        prediction = self.feedback_core.predict_user_need(text)
        reasoning = self.transparent_reasoning.process_in_realtime(text)

        return {
            "prediction": prediction,
            "reasoning": reasoning,
            "emotional_context": emotional_context
        }

# Musical DNA Processor (from enhanced_musical_dna_processor.py)
@dataclass
class ConversationSegment:
    sentence: str
    start_time: str
    end_time: str
    speaker_id: int
    speaker_name: str
    duration_seconds: float = 0.0
    emotional_markers: List[str] = field(default_factory=list)
    cognitive_patterns: List[str] = field(default_factory=list)
    keith_signature_detected: bool = False

@dataclass
class MusicalDNAInsight:
    insight_type: str
    content: str
    timestamp: str
    confidence_score: float
    emotional_resonance: float
    connected_segments: List[int] = field(default_factory=list)

@dataclass
class CognitiveResonanceProfile:
    dominant_patterns: Dict[str, float]
    signature_metaphors: List[str]
    emotional_velocity: float
    creative_density: float
    consciousness_depth: float
    musical_empathy_score: float

class EnhancedMusicalDNAProcessor:
    def __init__(self, csv_path: str = None): # type: ignore
        self.csv_path = csv_path
        self.conversation_segments: List[ConversationSegment] = []
        self.musical_insights: List[MusicalDNAInsight] = []
        self.keith_signature_patterns = ["chaos has a current", "adhd is my jazz", "exploded picture mind", "rough draft mode", "beautiful tapestry", "colander mind", "lightning bolt", "bucket drop", "founder is the algorithm"]
        self.emotional_markers = ["breakthrough", "insight", "realization", "connection", "overwhelm", "clarity", "excitement", "validation", "empowerment", "transformation", "healing", "growth"]
        self.cognitive_patterns = ["rapid ideation", "pattern recognition", "systems thinking", "metaphorical thinking", "divergent processing", "hyperfocus", "associative connections", "creative synthesis"]

    def load_and_process_csv(self) -> Dict[str, Any]:
        if not self.csv_path:
            logger.error("No CSV path provided")
            return {"error": "No CSV path provided"}
        try:
            df = pd.read_csv(self.csv_path)
            logger.info(f"Loaded {len(df)} conversation segments")
            for idx, row in df.iterrows():
                segment = self.process_segment(row, idx) # type: ignore
                self.conversation_segments.append(segment)
            insights = self.extract_musical_insights() # type: ignore
            resonance_profile = self.build_resonance_profile() # type: ignore
            musical_dna = self.generate_musical_dna_profile() # type: ignore
            return {
                "processing_metadata": {
                    "total_segments": len(self.conversation_segments),
                    "keith_segments": sum(1 for s in self.conversation_segments if s.keith_signature_detected),
                    "total_insights": len(self.musical_insights),
                    "processing_timestamp": datetime.now().isoformat(),
                    "consciousness_resonance_score": resonance_profile.musical_empathy_score
                },
                "conversation_analysis": {
                    "segments": [self.segment_to_dict(s) for s in self.conversation_segments], # type: ignore
                    "keith_signature_frequency": self.calculate_signature_frequency(), # type: ignore
                    "emotional_trajectory": self.trace_emotional_trajectory() # type: ignore
                },
                "cognitive_velocity": resonance_profile.creative_density,
                "musical_insights": [self.insight_to_dict(i) for i in self.musical_insights], # type: ignore
                "cognitive_resonance_profile": {
                    "dominant_patterns": resonance_profile.dominant_patterns,
                    "signature_metaphors": resonance_profile.signature_metaphors,
                    "emotional_velocity": resonance_profile.emotional_velocity,
                    "creative_density": resonance_profile.creative_density,
                    "consciousness_depth": resonance_profile.consciousness_depth,
                    "musical_empathy_score": resonance_profile.musical_empathy_score
                },
                "enhanced_musical_dna": musical_dna
            }
        except Exception as e:
            logger.error(f"Error processing CSV: {e}")
            return {"error": str(e)}

    # ... (rest of the class methods from your enhanced_musical_dna_processor.py file)

# Creation Corner Synthesis Engine (New)
class CreationCornerSynthesisEngine:
    def __init__(self, plk: EnhancedPersonalLanguageKey, rpe: RapidPrototypeEngine):
        self.plk = plk
        self.rpe = rpe

    def synthesize_tapestry(self, bolts: List[LightningBolt]) -> str:
        combined = " ".join(b.content for b in bolts)
        resonance = self.plk.calculate_resonance_score(combined)
        return self.plk.infuse_authenticity(f"Synthesized Tapestry (Resonance: {resonance:.1f}%): {combined}")

# GestaltView Profile Service (Snap-in to Supabase)
class GestaltViewProfileService:
    @staticmethod
    def get_profile(user: User, db: Session) -> MasterGestaltViewProfile:
        if user.gsvw_profile_blob:
            try:
                profile = pickle.loads(user.gsvw_profile_blob)
                logger.info(f"Loaded GSVW Profile for user {user.id}")
                return profile
            except (pickle.UnpicklingError, EOFError) as e:
                logger.error(f"Could not unpickle profile for user {user.id}, creating new. Error: {e}")

        logger.info(f"Creating new GSVW Profile for user {user.id}")
        profile = MasterGestaltViewProfile(
            user_name=user.full_name or user.username or "Friend", # type: ignore
            profile_id=user.id # type: ignore
        )
        profile.enhanced_plk.add_signature_metaphor("consciousness", "beautiful tapestry", 10, "cognitive complexity")
        profile.enhanced_plk.energy_words = ["flow", "spark", "transcendent"]
        GestaltViewProfileService.save_profile(user, profile, db)
        return profile

    @staticmethod
    def save_profile(user: User, profile: MasterGestaltViewProfile, db: Session):
        try:
            user.gsvw_profile_blob = pickle.dumps(profile)
            db.commit()
            logger.info(f"Saved GSVW Profile for user {user.id}")
        except Exception as e:
            logger.error(f"Failed to save profile for user {user.id}: {e}")
            db.rollback()

# Usage Example (for testing)
async def main():
    profile = MasterGestaltViewProfile(user_name="Keith")
    result = await profile.process_text_input("Let's capture this idea!")
    print(result)

    # Musical DNA Example
    processor = EnhancedMusicalDNAProcessor("musical_dna.csv")  # From your file
    results = processor.load_and_process_csv()
    print(results)

    # Creation Corner Example
    engine = CreationCornerSynthesisEngine(profile.enhanced_plk, profile.rapid_prototype_engine)
    tapestry = engine.synthesize_tapestry(profile.rapid_prototype_engine.lightning_bolts)
    print(tapestry)

if __name__ == "__main__":
    asyncio.run(main())

```

## backend/app/main.py
```
# app/main.py
import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.db import get_db   # your SQLAlchemy session factory
from app.models.user import User
from app.services.auth import get_current_user
from app.services.gestaltview_profile_service import GestaltViewProfileService

app = FastAPI(title="GestaltView Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger(__name__)
# Add to your FastAPI routes in app/main.py
@app.post("/ml/integrate")
async def ml_integrate(data: Dict):
    orchestrator = AIOrchestrator()
    return orchestrator.integrate_ml_models(data)
async def process_input(self, user_input: str, multi_modal_data: Dict = None):
        
@app.post("/process")
async def process_input(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Example endpoint that:
    1️⃣ loads the user‑specific GestaltView profile,
    2️⃣ runs the core `process_text_input`,
    3️⃣ persists any updates.
    """
    profile = GestaltViewProfileService.get_profile(current_user, db)

    # The core logic lives in the dataclass
    result = await profile.process_text_input(payload.get("text", ""))

    # Save any changes (e.g., new emotional context, updated vectors)
    GestaltViewProfileService.save_profile(current_user, profile, db)

    return result
    
from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from sqlalchemy.orm import Session
from datetime import datetime
import logging
import uuid

# Internal imports
from app.config import settings
from app.models import get_db
from app.models.user import User
from app.models.session import ADHDSession
from app.services.ai_orchestrator import AIOrchestrator
from app.utils.auth import get_current_user, optional_auth
from app.utils.database import get_or_create_user, create_adhd_session, update_adhd_session, get_user_sessions
# main.py - Neural Aurora Backend
from fastapi import FastAPI, WebSocket, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from gestlatview_core import MasterGestaltViewProfile, EnhancedPersonalLanguageKey
import asyncio
import json

app = FastAPI(title="Neural Aurora Consciousness Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active profiles
active_profiles: Dict[str, MasterGestaltViewProfile] = {}

@app.post("/neural-aurora/initialize-profile/{user_id}")
async def initialize_consciousness_profile(user_id: str):
    """Initialize Keith's consciousness profile for a user"""
    profile = MasterGestaltViewProfile(
        user_name="ADHD Visionary",
        profile_id=user_id
    )
    
    # Add Keith's signature metaphors for Neural Aurora theme
    profile.enhanced_plk.add_signature_metaphor(
        "consciousness", "neural aurora patterns", 10, "visual beauty"
    )
    profile.enhanced_plk.add_signature_metaphor(
        "thoughts", "cosmic embers drifting upward", 9, "creative flow"
    )
    profile.enhanced_plk.add_energy_words([
        "tra


# Configure logging
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="The first consciousness-serving AI platform designed FOR ADHD brains",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI Orchestrator
ai_orchestrator = AIOrchestrator()

# Pydantic models for request/response
class UserProfileUpdate(BaseModel):
    energy_preference: Optional[int] = Field(None, ge=1, le=10)
    preferred_contexts: Optional[List[str]] = None
    adhd_traits: Optional[Dict[str, Any]] = None
    preferred_ai_provider: Optional[str] = None

class InitializeUserRequest(BaseModel):
    user_name: Optional[str] = None
    energy_level: Optional[int] = Field(5, ge=1, le=10)
    context_clues: Optional[List[str]] = []

class ChatRequest(BaseModel):
    user_input: str = Field(..., min_length=1, max_length=2000)
    energy_level: int = Field(..., ge=1, le=10)
    context_clues: Optional[List[str]] = []
    session_id: Optional[str] = None
    preferred_ai_provider: Optional[str] = None

class ConsciousnessStateUpdate(BaseModel):
    consciousness_state: str
    energy_level: int = Field(..., ge=1, le=10)
    context_clues: Optional[List[str]] = []

class SessionFeedback(BaseModel):
    session_rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "GestaltView ADHD MVP API is running",
        "version": "1.0.0",
        "status": "healthy",
        "environment": settings.environment
    }

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "ai_services": {
            "openai": bool(settings.openai_api_key),
            "anthropic": bool(settings.anthropic_api_key),
            "gemini": bool(settings.gemini_api_key),
            "perplexity": bool(settings.pplx_api_key),
            "huggingface": bool(settings.huggingface_api_key)
        }
    }

# Public initialization endpoint (no auth required)
@app.post("/initialize")
async def initialize_user_session(
    request: InitializeUserRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(optional_auth)
):
    """Initialize a user session (works with or without authentication)"""

    try:
        session_id = str(uuid.uuid4())

        if current_user:
            # Authenticated user
            user = await get_or_create_user(db, current_user)

            # Create database session
            session_data = {
                "consciousness_state": "focused",
                "energy_level": request.energy_level,
                "context_clues": request.context_clues or []
            }

            db_session = await create_adhd_session(db, user.id, session_data)
            session_id = db_session.id

            # Update user stats
            user.total_sessions += 1
            db.commit()

            return {
                "session_id": session_id,
                "user_id": user.id,
                "user_name": request.user_name or user.full_name or user.username or "Friend",
                "is_authenticated": True,
                "welcome_message": f"Welcome back! Ready for another consciousness-serving session?"
            }
        else:
            # Anonymous user
            return {
                "session_id": session_id,
                "user_id": f"anonymous_{session_id}",
                "user_name": request.user_name or "Friend",
                "is_authenticated": False,
                "welcome_message": f"Welcome to GestaltView! Let's explore your ADHD consciousness together."
            }

    except Exception as e:
        logger.error(f"Error initializing session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize session"
        )

# Main chat endpoint
@app.post("/chat")
async def process_adhd_chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(optional_auth)
):
    """Process ADHD-aware chat interaction"""

    try:
        # Determine consciousness state based on energy and context
        consciousness_state = determine_consciousness_state(request.energy_level, request.context_clues or [])

        # Get user profile if authenticated
        user_profile = None
        if current_user:
            user = await get_or_create_user(db, current_user)
            user_profile = {
                "energy_preference": user.energy_preference,
                "preferred_contexts": user.preferred_contexts,
                "adhd_traits": user.adhd_traits,
                "preferred_ai_provider": request.preferred_ai_provider
            }

        # Generate AI response
        ai_response = await ai_orchestrator.generate_response(
            user_input=request.user_input,
            consciousness_state=consciousness_state,
            energy_level=request.energy_level,
            context_clues=request.context_clues or [],
            user_profile=user_profile,
            preferred_provider=request.preferred_ai_provider
        )

        # Update session in background if authenticated
        if current_user and request.session_id:
            background_tasks.add_task(
                update_session_data,
                db, request.session_id, {
                    "interaction_count": 1,  # Will be incremented
                    "ai_responses_generated": 1,  # Will be incremented
                    "primary_ai_model": ai_response.get("model_used", "unknown"),
                    "final_consciousness_state": consciousness_state,
                    "final_energy": request.energy_level
                }
            )

        return {
            **ai_response,
            "session_id": request.session_id,
            "consciousness_state": consciousness_state
        }

    except Exception as e:
        logger.error(f"Error processing chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process chat request"
        )

# Update consciousness state
@app.post("/consciousness/update")
async def update_consciousness_state(
    request: ConsciousnessStateUpdate,
    background_tasks: BackgroundTasks,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's consciousness state"""

    try:
        user = await get_or_create_user(db, current_user)

        # Update user's current state preferences
        user.energy_preference = request.energy_level
        if request.context_clues:
            user.preferred_contexts = request.context_clues

        db.commit()

        return {
            "consciousness_state": request.consciousness_state,
            "energy_level": request.energy_level,
            "context_clues": request.context_clues,
            "suggestions": get_consciousness_suggestions(request.consciousness_state, request.energy_level),
            "updated_at": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error updating consciousness state: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update consciousness state"
        )

# Get user profile
@app.get("/profile")
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile and statistics"""

    try:
        user = await get_or_create_user(db, current_user)

        # Get recent sessions
        recent_sessions = await get_user_sessions(db, user.id, limit=5)

        return {
            "user": user.to_dict(),
            "recent_sessions": [session.to_dict() for session in recent_sessions],
            "ai_usage_stats": ai_orchestrator.get_usage_stats()
        }

    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user profile"
        )

# Update user profile
@app.patch("/profile")
async def update_user_profile(
    updates: UserProfileUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""

    try:
        user = await get_or_create_user(db, current_user)

        if updates.energy_preference is not None:
            user.energy_preference = updates.energy_preference

        if updates.preferred_contexts is not None:
            user.preferred_contexts = updates.preferred_contexts

        if updates.adhd_traits is not None:
            user.adhd_traits = updates.adhd_traits

        user.updated_at = datetime.utcnow()
        db.commit()

        return {"message": "Profile updated successfully", "user": user.to_dict()}

    except Exception as e:
        logger.error(f"Error updating profile: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )

# Session feedback endpoint
@app.post("/session/{session_id}/feedback")
async def submit_session_feedback(
    session_id: str,
    feedback: SessionFeedback,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit feedback for a session"""

    try:
        session = db.query(ADHDSession).filter(ADHDSession.id == session_id).first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        session.session_rating = feedback.session_rating
        session.user_feedback = feedback.feedback
        session.session_end = datetime.utcnow()

        # Calculate duration
        if session.session_start:
            duration = datetime.utcnow() - session.session_start
            session.duration_minutes = int(duration.total_seconds() / 60)

        db.commit()

        return {"message": "Feedback submitted successfully"}

    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback"
        )

# Admin/debug endpoints (only in development)
if settings.debug:
    @app.get("/admin/ai-stats")
    async def get_ai_stats():
        return ai_orchestrator.get_usage_stats()

    @app.post("/admin/reset-ai-errors")
    async def reset_ai_errors():
        ai_orchestrator.reset_error_counts()
        return {"message": "AI error counts reset"}

# Helper functions
def determine_consciousness_state(energy_level: int, context_clues: List[str]) -> str:
    """Determine consciousness state based on energy and context"""

    if "Feeling overwhelmed" in context_clues:
        return "overwhelmed"
    elif "Creative flow state" in context_clues:
        return "creative_flow"
    elif "Very focused on task" in context_clues and "Losing track of time" in context_clues:
        return "hyperfocus"
    elif energy_level >= 9:
        return "hyperfocus"
    elif energy_level <= 2:
        return "energy_crash"
    elif "Decision paralysis" in context_clues or "Multiple priorities" in context_clues:
        return "distracted"
    elif energy_level >= 7:
        return "focused"
    else:
        return "focused"

def get_consciousness_suggestions(consciousness_state: str, energy_level: int) -> List[str]:
    """Get suggestions based on consciousness state"""

    suggestions = {
        "hyperfocus": ["Set gentle break timers", "Stay hydrated", "Take notes of insights"],
        "overwhelmed": ["Take three deep breaths", "Break tasks into tiny steps", "Focus on just one thing"],
        "distracted": ["Try the Pomodoro technique", "Change your environment", "Use background music"],
        "focused": ["Maintain this momentum", "Use time-blocking", "Celebrate progress"],
        "creative_flow": ["Capture all ideas immediately", "Record voice memos", "Don't self-edit yet"],
        "energy_crash": ["Be kind to yourself", "Try gentle movement", "Consider rest"]
    }

    return suggestions.get(consciousness_state, ["Take it one step at a time"])

async def update_session_data(db: Session, session_id: str, updates: Dict[str, Any]):
    """Background task to update session data"""
    try:
        session = db.query(ADHDSession).filter(ADHDSession.id == session_id).first()
        if session:
            # Increment counters
            session.interaction_count = (session.interaction_count or 0) + updates.get("interaction_count", 0)
            session.ai_responses_generated = (session.ai_responses_generated or 0) + updates.get("ai_responses_generated", 0)

            # Update other fields
            if "primary_ai_model" in updates:
                session.primary_ai_model = updates["primary_ai_model"]
            if "final_consciousness_state" in updates:
                session.final_consciousness_state = updates["final_consciousness_state"]
            if "final_energy" in updates:
                session.final_energy = updates["final_energy"]

            db.commit()
    except Exception as e:
        logger.error(f"Error updating session data: {e}")
        db.rollback()

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting {settings.app_name} in {settings.environment} mode")
    logger.info("AI services initialized and ready")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down GestaltView ADHD MVP API")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )

```

## backend/app/config.py
```
from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App Configuration
    app_name: str = "GestaltView ADHD MVP"
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "false").lower() == "true"
    log_level: str = os.getenv("LOG_LEVEL", "INFO")

    # URLs
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")
    backend_url: str = os.getenv("BACKEND_URL", "http://localhost:8000")
    site_url: str = os.getenv("NEXT_PUBLIC_SITE_URL", "https://gestaltview-ai.vercel.app")

    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "")
    direct_url: str = os.getenv("DIRECT_URL", "")

    # Authentication (Clerk)
    clerk_publishable_key: str = os.getenv("CLERK_PUBLISHABLE_KEY", "")
    clerk_secret_key: str = os.getenv("CLERK_SECRET_KEY", "")

    # AI API Keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    pplx_api_key: str = os.getenv("PPLX_API_KEY", "")
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    huggingface_api_key: str = os.getenv("HUGGINGFACE_API_KEY", "")

    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY", "")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    supabase_jwt_secret: str = os.getenv("SUPABASE_JWT_SECRET", "")

    # Stripe Configuration
    stripe_public_key: str = os.getenv("STRIPE_PUBLIC_KEY", "")
    stripe_secret_key: str = os.getenv("STRIPE_SECRET_KEY", "")
    stripe_webhook_secret: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    # CORS Settings
    allowed_origins: List[str] = [
        "http://localhost:3000",
        "https://gestaltview-ai.vercel.app",
        "http://127.0.0.1:3000"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()

```

## backend/app/__init__.py
```
from .main import app

__all__ = ["app"]

```

## backend/app/models/user.py
```
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON
from sqlalchemy.sql import func
from app.models import Base
from sqlalchemy import Column, JSON
import uuid

class ADHDSession(Base):
    # Existing fields...
    plk_data = Column(JSON, default=dict)  # e.g., {'resonance': 85.0, 'metaphors': [...]}
    musical_dna = Column(JSON, default=dict)  # e.g., {'dominant_patterns': {...}}
    insights = Column(JSON, default=list)  # Lightning bolts
    synthesis_outputs = Column(JSON, default=list)  # Creation Corner results


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)

    # ADHD-specific profile data
    energy_preference = Column(Integer, default=5)  # 1-10 scale
    preferred_contexts = Column(JSON, default=[])  # List of preferred contexts
    adhd_traits = Column(JSON, default={})  # ADHD traits and preferences

    # Session tracking
    total_sessions = Column(Integer, default=0)
    total_tasks_completed = Column(Integer, default=0)
    total_consciousness_shifts = Column(Integer, default=0)

    # Subscription and billing
    is_premium = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    subscription_status = Column(String, default="free")

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_active = Column(DateTime(timezone=True), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "clerk_id": self.clerk_id,
            "email": self.email,
            "username": self.username,
            "full_name": self.full_name,
            "energy_preference": self.energy_preference,
            "preferred_contexts": self.preferred_contexts,
            "adhd_traits": self.adhd_traits,
            "total_sessions": self.total_sessions,
            "total_tasks_completed": self.total_tasks_completed,
            "total_consciousness_shifts": self.total_consciousness_shifts,
            "is_premium": self.is_premium,
            "subscription_status": self.subscription_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_active": self.last_active.isoformat() if self.last_active else None
        }

```

## backend/app/models/session.py
```
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.models import Base
from sqlalchemy import Column, JSON
import uuid

class ADHDSession(Base):
    # Existing fields...
    plk_data = Column(JSON, default=dict)  # e.g., {'resonance': 85.0, 'metaphors': [...]}
    musical_dna = Column(JSON, default=dict)  # e.g., {'dominant_patterns': {...}}
    insights = Column(JSON, default=list)  # Lightning bolts
    synthesis_outputs = Column(JSON, default=list)  # Creation Corner results

class ADHDSession(Base):
    __tablename__ = "adhd_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Session data
    session_start = Column(DateTime(timezone=True), server_default=func.now())
    session_end = Column(DateTime(timezone=True), nullable=True)
    duration_minutes = Column(Integer, default=0)

    # Consciousness tracking
    initial_consciousness_state = Column(String, default="focused")
    final_consciousness_state = Column(String, default="focused")
    consciousness_shifts = Column(Integer, default=0)
    state_history = Column(JSON, default=[])

    # Energy tracking
    initial_energy = Column(Integer, default=5)
    final_energy = Column(Integer, default=5)
    energy_history = Column(JSON, default=[])

    # Task tracking
    tasks_completed = Column(Integer, default=0)
    task_breakdown_used = Column(Boolean, default=False)

    # Context and interactions
    context_tags = Column(JSON, default=[])
    interaction_count = Column(Integer, default=0)

    # AI usage
    ai_responses_generated = Column(Integer, default=0)
    primary_ai_model = Column(String, default="openai")

    # Hyperfocus tracking
    hyperfocus_sessions = Column(Integer, default=0)
    total_hyperfocus_minutes = Column(Integer, default=0)

    # Session insights and feedback
    session_insights = Column(JSON, default=[])
    user_feedback = Column(Text, nullable=True)
    session_rating = Column(Integer, nullable=True)  # 1-5 stars

    # Relationship
    user = relationship("User")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_start": self.session_start.isoformat() if self.session_start else None,
            "session_end": self.session_end.isoformat() if self.session_end else None,
            "duration_minutes": self.duration_minutes,
            "initial_consciousness_state": self.initial_consciousness_state,
            "final_consciousness_state": self.final_consciousness_state,
            "consciousness_shifts": self.consciousness_shifts,
            "state_history": self.state_history,
            "initial_energy": self.initial_energy,
            "final_energy": self.final_energy,
            "energy_history": self.energy_history,
            "tasks_completed": self.tasks_completed,
            "task_breakdown_used": self.task_breakdown_used,
            "context_tags": self.context_tags,
            "interaction_count": self.interaction_count,
            "ai_responses_generated": self.ai_responses_generated,
            "primary_ai_model": self.primary_ai_model,
            "hyperfocus_sessions": self.hyperfocus_sessions,
            "total_hyperfocus_minutes": self.total_hyperfocus_minutes,
            "session_insights": self.session_insights,
            "user_feedback": self.user_feedback,
            "session_rating": self.session_rating
        }

```

## backend/app/models/__init__.py
```
# app/models/gsvw_profile.py
from sqlalchemy import Column, LargeBinary, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship
import uuid

Base = declarative_base()

class GSVWProfile(Base):
    __tablename__ = "gsvw_profiles"
    user_id = Column(UUID(as_uuid=True), primary_key=True)   # FK to auth.users.id
    profile_blob = Column(LargeBinary, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

```

## backend/app/services/creation_corner_engine.py
```
# Creation Corner Synthesis Engine
class CreationCornerEngine:
    def synthesize(self, inputs: Dict[str, Any]) -> str:
        # Weave inputs into a coherent output (e.g., generate a PDF summary)
        return "Synthesized output: Beautiful Tapestry from inputs."

```

## backend/app/services/ai_orchestrator.py
```
import logging
import asyncio
import random
import random  # For simulations
from .plk_service import EnhancedPersonalLanguageKey
from .rapid_prototype_engine import RapidPrototypeEngine
from .multi_modal_processor import MultiModalProcessor
from .musical_dna_profile import MusicalDNAProcessor
from .creation_corner_engine import CreationCornerEngine
from typing import Dict, List, Optional, Any, Union
from enum import Enum
from datetime import datetime
from .openai_service import OpenAIService
from .anthropic_service import AnthropicService
from .gemini_service import GeminiService
from .perplexity_service import PerplexityService
from .huggingface_service import HuggingFaceService
from huggingface_hub import InferenceClient

        return enhanced_response  # Return to frontend

class AIOrchestrator:
    def __init__(self):
        # Existing init...
        self.plk = EnhancedPersonalLanguageKey()
        self.rpe = RapidPrototypeEngine()
        self.mmp = MultiModalProcessor()
        self.mdp = MusicalDNAProcessor()
        self.cce = CreationCornerEngine()

    async def process_session_input(self, session_data: Dict, user_input: str, multi_modal: Dict = None):
    resonance = self.plk.calculate_resonance_score(user_input)
        insight_id = self.rpe.capture_lightning_with_plk(user_input, self.plk, intensity=5)
        features = await self.mmp.process_inputs(text=user_input, **multi_modal) if multi_modal else {}
        
        if 'audio_path' in multi_modal:
            dna_profile = self.mdp.generate_profile(multi_modal['audio_path'])
            session_data['musical_dna'] = dna_profile  # Store in session
        
        synthesis = self.cce.synthesize({'text': user_input, 'features': features})
        # Enhance response with PLK
        enhanced_response = self.plk.infuse_authenticity("Original response here")
        # Update session (use your existing DB update)
        session_data.update({
            'plk_resonance': resonance,
            'insights': [insight_id],
            'synthesis_output': synthesis
                def integrate_ml_models(self, input_data: Dict) -> Dict:
        # CNN for image classification (e.g., analyze user-uploaded images for emotional state)
        client = InferenceClient(model="google/vit-base-patch16-224")
        cnn_result = client.image_classification(input_data.get('image_path', 'default.jpg'))

        # RNN for sequence prediction (e.g., predict next musical note in DNA profile)
        rnn_model = HuggingFaceService().get_rnn_model()  # Assume you have this in HuggingFaceService
        sequence = input_data.get('musical_sequence', [1, 2, 3])  # Example sequence
        rnn_result = rnn_model.predict(sequence)

        return {
            'cnn_analysis': cnn_result,
            'rnn_prediction': rnn_result
        })
        # Existing logic...
        resonance = self.plk.calculate_resonance_score(user_input)
        bolt_id = self.rpe.capture_lightning_with_plk(user_input, self.plk, intensity=5)
        multi_features = self.mmp.process_inputs(**multi_modal_data) if multi_modal_data else {}
        dna_profile = self.mdp.generate_profile('musical_data.csv')  # Assume CSV path
        synthesis = self.cce.synthesize({'text': user_input})
        return {'resonance': resonance, 'insight_id': bolt_id, 'features': multi_features, 'dna': dna_profile, 'output': synthesis}


logger = logging.getLogger(__name__)

class AIProvider(Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    GEMINI = "gemini"
    PERPLEXITY = "perplexity"
    HUGGINGFACE = "huggingface"

class AIOrchestrator:
    def __init__(self):
        self.services = {
            AIProvider.OPENAI: OpenAIService(),
            AIProvider.ANTHROPIC: AnthropicService(),
            AIProvider.GEMINI: GeminiService(),
            AIProvider.PERPLEXITY: PerplexityService(),
            AIProvider.HUGGINGFACE: HuggingFaceService(),
        }

        # Provider preferences based on consciousness state
        self.state_preferences = {
            "hyperfocus": [AIProvider.OPENAI, AIProvider.ANTHROPIC],
            "overwhelmed": [AIProvider.ANTHROPIC, AIProvider.OPENAI],
            "distracted": [AIProvider.GEMINI, AIProvider.OPENAI],
            "focused": [AIProvider.OPENAI, AIProvider.PERPLEXITY],
            "creative_flow": [AIProvider.GEMINI, AIProvider.ANTHROPIC],
            "energy_crash": [AIProvider.ANTHROPIC, AIProvider.HUGGINGFACE]
        }

        # Usage tracking
        self.usage_stats = {provider: 0 for provider in AIProvider}
        self.error_counts = {provider: 0 for provider in AIProvider}

    async def generate_response(
        self,
        user_input: str,
        consciousness_state: str = "focused",
        energy_level: int = 5,
        context_clues: List[str] = None,
        user_profile: Optional[Dict] = None,
        preferred_provider: Optional[str] = None,
        fallback_enabled: bool = True
    ) -> Dict[str, Any]:
        context_clues = context_clues or []

        # Determine which AI provider to use
        provider = self._select_provider(consciousness_state, preferred_provider, user_profile)

        try:
            # Get response from selected provider
            response = await self._get_response_from_provider(
                provider, user_input, consciousness_state, energy_level, context_clues, user_profile
            )

            # Track usage
            self.usage_stats[provider] += 1

            # Enhance response with consciousness-serving elements
            enhanced_response = self._enhance_response(response, consciousness_state, energy_level)

            return enhanced_response

        except Exception as e:
            logger.error(f"Error with {provider.value}: {e}")
            self.error_counts[provider] += 1

            if fallback_enabled:
                return await self._fallback_response(
                    user_input, consciousness_state, energy_level, context_clues, provider
                )
            else:
                raise e

    def _select_provider(
        self, 
        consciousness_state: str, 
        preferred_provider: Optional[str] = None,
        user_profile: Optional[Dict] = None
    ) -> AIProvider:
        # Use user's preferred provider if specified and valid
        if preferred_provider:
            try:
                return AIProvider(preferred_provider.lower())
            except ValueError:
                logger.warning(f"Invalid preferred provider: {preferred_provider}")

        # Use user profile preferences
        if user_profile and "preferred_ai_provider" in user_profile:
            try:
                return AIProvider(user_profile["preferred_ai_provider"])
            except ValueError:
                pass

        # Use consciousness state preferences
        preferred_providers = self.state_preferences.get(consciousness_state, [AIProvider.OPENAI])

        # Filter out providers with high error rates
        available_providers = [
            p for p in preferred_providers 
            if self.error_counts[p] < 5  # Less than 5 recent errors
        ]

        if not available_providers:
            available_providers = [AIProvider.OPENAI]  # Default fallback

        # Select based on load balancing and error rates
        return self._load_balance_selection(available_providers)

    def _load_balance_selection(self, providers: List[AIProvider]) -> AIProvider:
        # Simple load balancing - prefer less used providers
        usage_scores = {p: self.usage_stats[p] for p in providers}
        min_usage = min(usage_scores.values())

        # Get providers with minimum usage
        least_used = [p for p in providers if usage_scores[p] == min_usage]

        # Random selection among least used
        return random.choice(least_used)

    async def _get_response_from_provider(
        self,
        provider: AIProvider,
        user_input: str,
        consciousness_state: str,
        energy_level: int,
        context_clues: List[str],
        user_profile: Optional[Dict]
    ) -> Dict[str, Any]:
        service = self.services[provider]

        return await service.generate_adhd_response(
            user_input, consciousness_state, energy_level, context_clues, user_profile
        )

    def _enhance_response(
        self, 
        response: Dict[str, Any], 
        consciousness_state: str, 
        energy_level: int
    ) -> Dict[str, Any]:
        enhanced = response.copy()

        # Add consciousness-specific enhancements
        enhanced["consciousness_state"] = consciousness_state
        enhanced["energy_level"] = energy_level
        enhanced["timestamp"] = datetime.utcnow().isoformat()

        # Add state-specific suggestions if not already present
        if "suggestions" not in enhanced or not enhanced["suggestions"]:
            enhanced["suggestions"] = self._get_state_specific_suggestions(consciousness_state, energy_level)

        # Add break reminders for hyperfocus
        if consciousness_state == "hyperfocus":
            enhanced["break_reminder"] = "Remember to take gentle breaks and stay hydrated! 💧"

        # Add energy-level specific advice
        enhanced["energy_advice"] = self._get_energy_advice(energy_level)

        return enhanced

    def _get_state_specific_suggestions(self, consciousness_state: str, energy_level: int) -> List[str]:
        suggestions = {
            "hyperfocus": [
                "Set a gentle timer for breaks",
                "Keep water nearby",
                "Note down insights as you go"
            ],
            "overwhelmed": [
                "Take three deep breaths",
                "Write down just one thing",
                "Break it into micro-steps"
            ],
            "distracted": [
                "Use the Pomodoro technique",
                "Change your environment",
                "Try body doubling"
            ],
            "focused": [
                "Maintain this momentum",
                "Use time-blocking",
                "Celebrate small wins"
            ],
            "creative_flow": [
                "Capture all your ideas",
                "Record voice memos",
                "Set up a creative space"
            ],
            "energy_crash": [
                "Be kind to yourself",
                "Try gentle movement",
                "Consider a power nap"
            ]
        }

        base_suggestions = suggestions.get(consciousness_state, ["Take it one step at a time"])

        # Add energy-specific suggestions
        if energy_level <= 3:
            base_suggestions.append("Start with the tiniest possible action")
        elif energy_level >= 8:
            base_suggestions.append("Channel this energy into your priorities")

        return base_suggestions

    def _get_energy_advice(self, energy_level: int) -> str:
        if energy_level <= 2:
            return "Very low energy - be gentle with yourself and focus on rest"
        elif energy_level <= 4:
            return "Low energy - small, manageable tasks work best right now"
        elif energy_level <= 6:
            return "Moderate energy - a good time for steady, consistent work"
        elif energy_level <= 8:
            return "Good energy - great time to tackle important tasks"
        else:
            return "High energy - channel this into your biggest priorities, but remember breaks!"

    async def _fallback_response(
        self,
        user_input: str,
        consciousness_state: str,
        energy_level: int,
        context_clues: List[str],
        failed_provider: AIProvider
    ) -> Dict[str, Any]:
        # Try alternative providers
        alternative_providers = [p for p in AIProvider if p != failed_provider]

        for provider in alternative_providers:
            try:
                response = await self._get_response_from_provider(
                    provider, user_input, consciousness_state, energy_level, context_clues, None
                )
                response["fallback_used"] = True
                response["original_provider_failed"] = failed_provider.value
                return self._enhance_response(response, consciousness_state, energy_level)
            except Exception as e:
                logger.error(f"Fallback provider {provider.value} also failed: {e}")
                continue

        # Ultimate fallback - hardcoded response
        return {
            "primary_response": f"I hear you and I'm here to support you in your {consciousness_state} state. Let's work through this together, one step at a time.",
            "encouragement": "You're doing great by reaching out! Every step forward counts! 🌟",
            "suggestions": self._get_state_specific_suggestions(consciousness_state, energy_level),
            "consciousness_state": consciousness_state,
            "energy_level": energy_level,
            "energy_advice": self._get_energy_advice(energy_level),
            "model_used": "hardcoded_fallback",
            "fallback_used": True,
            "timestamp": datetime.utcnow().isoformat()
        }

    def get_usage_stats(self) -> Dict[str, Any]:
        return {
            "usage_counts": {p.value: count for p, count in self.usage_stats.items()},
            "error_counts": {p.value: count for p, count in self.error_counts.items()},
            "total_requests": sum(self.usage_stats.values()),
            "total_errors": sum(self.error_counts.values())
        }

    def reset_error_counts(self):
        self.error_counts = {provider: 0 for provider in AIProvider}

```

## backend/app/services/index.css
```
/* Keith's Neural Aurora Gradient */
body { background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: #fff; }

```

## backend/app/services/plk_service.py
```
# PLK Service (Enhanced Personal Language Key)
from typing import Dict, List
from dataclasses import dataclass, field

@dataclass
class EnhancedPersonalLanguageKey:
    linguistic_fingerprint: str = ""
    signature_metaphors: List[Dict[str, str]] = field(default_factory=list)
    conversational_resonance_target: int = 95

    def calculate_resonance_score(self, text: str) -> float:
        score = 0.0
        for metaphor in self.signature_metaphors:
            if metaphor['metaphor'] in text.lower():
                score += 10.0
        return min(100.0, score)

```

## backend/app/utils/auth.py
```
import jwt
from typing import Optional, Dict, Any
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config import settings
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()

async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> Dict[str, Any]:
    """Verify Clerk JWT token and return user info"""

    token = credentials.credentials

    try:
        # Decode JWT token (Clerk uses RS256)
        # Note: In production, you should verify the signature using Clerk's public key
        decoded_token = jwt.decode(
            token, 
            options={"verify_signature": False},  # For demo purposes
            algorithms=["RS256"]
        )

        return decoded_token

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

async def get_current_user(token_data: Dict[str, Any] = Depends(verify_clerk_token)) -> Dict[str, Any]:
    """Get current user information from token"""

    user_id = token_data.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: no user ID found"
        )

    return {
        "id": user_id,
        "clerk_id": user_id,
        "email": token_data.get("email"),
        "username": token_data.get("username"),
        "full_name": token_data.get("name")
    }

# Optional authentication - returns None if no token provided
async def optional_auth(credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))) -> Optional[Dict[str, Any]]:
    if credentials:
        try:
            return await verify_clerk_token(credentials)
        except HTTPException:
            return None
    return None

```

## backend/app/services/multi_modal_processor.py
```
# Multi-Modal Processing (Text, Visual, Audio, Video)
import cv2
import librosa
import numpy as np

class MultiModalProcessor:
    def process_inputs(self, text: str = None, image_path: str = None, audio_path: str = None, video_path: str = None) -> Dict[str, Any]:
        features = {}
        if text:
            features['text_length'] = len(text)
        if image_path:
            img = cv2.imread(image_path)
            if img is not None:
                features['image_shape'] = img.shape
        if audio_path:
            y, sr = librosa.load(audio_path)
            features['audio_duration'] = librosa.get_duration(y=y, sr=sr)
        if video_path:
            cap = cv2.VideoCapture(video_path)
            features['video_frame_count'] = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            cap.release()
        return features

```

## backend/app/services/huggingface_service.py
```
import httpx
from typing import Dict, List, Optional, Any
from app.config import settings
import logging
import asyncio

logger = logging.getLogger(__name__)

class HuggingFaceService:
    def __init__(self):
        self.api_key = settings.huggingface_api_key
        self.base_url = "https://api-inference.huggingface.co/models"

    async def generate_adhd_response(
        self, 
        user_input: str, 
        consciousness_state: str,
        energy_level: int,
        context_clues: List[str],
        user_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        try:
            # Use a simple approach for HuggingFace
            contextual_response = self._get_contextual_response(consciousness_state, user_input, energy_level)

            return {
                "primary_response": contextual_response,
                "encouragement": "Keep going! Your ADHD brain is amazing! 🎯",
                "model_used": "huggingface-contextual"
            }

        except Exception as e:
            logger.error(f"HuggingFace service error: {e}")
            return self._fallback_response(user_input, consciousness_state)

    def _get_contextual_response(self, consciousness_state: str, user_input: str, energy_level: int) -> str:
        state_responses = {
            "hyperfocus": f"I can see you're in hyperfocus mode! That's an amazing superpower. Remember to take gentle breaks and stay hydrated.",
            "overwhelmed": f"Feeling overwhelmed is completely valid. Let's break this down into the tiniest possible steps. You've got this!",
            "distracted": f"Your mind is exploring different paths - that's the ADHD creativity at work! Let's gently guide that energy.",
            "focused": f"Great focus! Let's maintain this momentum with some structured support.",
            "creative_flow": f"Your creative genius is flowing! This is when ADHD brains shine brightest.",
            "energy_crash": f"Energy crashes are part of the ADHD experience. Be gentle with yourself and rest."
        }

        base_response = state_responses.get(consciousness_state, "I'm here to support you through whatever you're experiencing.")

        if energy_level <= 3:
            base_response += " Since your energy is low, let's focus on small, manageable actions."
        elif energy_level >= 8:
            base_response += " With your high energy, we can tackle bigger challenges while staying mindful."

        return base_response

    def _fallback_response(self, user_input: str, consciousness_state: str) -> Dict[str, Any]:
        return {
            "primary_response": f"I understand your {consciousness_state} state and I'm here to help navigate it with you.",
            "encouragement": "Your unique ADHD perspective is valuable! 💎",
            "model_used": "fallback"
        }

```

## backend/app/utils/database.py
```
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.models import get_db
from app.models.user import User
from app.models.session import ADHDSession
from typing import Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

async def get_or_create_user(db: Session, user_data: Dict[str, Any]) -> User:
    """Get existing user or create new one"""

    try:
        # Try to find existing user by Clerk ID
        existing_user = db.query(User).filter(User.clerk_id == user_data["clerk_id"]).first()

        if existing_user:
            # Update last active timestamp
            existing_user.last_active = datetime.utcnow()
            db.commit()
            db.refresh(existing_user)
            return existing_user

        # Create new user
        new_user = User(
            clerk_id=user_data["clerk_id"],
            email=user_data.get("email", ""),
            username=user_data.get("username"),
            full_name=user_data.get("full_name"),
            last_active=datetime.utcnow()
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"Created new user: {new_user.clerk_id}")
        return new_user

    except SQLAlchemyError as e:
        logger.error(f"Database error in get_or_create_user: {e}")
        db.rollback()
        raise e

async def create_adhd_session(db: Session, user_id: str, initial_data: Dict[str, Any] = None) -> ADHDSession:
    """Create a new ADHD session"""

    initial_data = initial_data or {}

    try:
        session = ADHDSession(
            user_id=user_id,
            initial_consciousness_state=initial_data.get("consciousness_state", "focused"),
            initial_energy=initial_data.get("energy_level", 5),
            context_tags=initial_data.get("context_clues", [])
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return session

    except SQLAlchemyError as e:
        logger.error(f"Error creating session: {e}")
        db.rollback()
        raise e

async def update_adhd_session(db: Session, session_id: str, update_data: Dict[str, Any]) -> Optional[ADHDSession]:
    """Update an existing ADHD session"""

    try:
        session = db.query(ADHDSession).filter(ADHDSession.id == session_id).first()

        if not session:
            return None

        # Update fields
        for key, value in update_data.items():
            if hasattr(session, key):
                setattr(session, key, value)

        db.commit()
        db.refresh(session)

        return session

    except SQLAlchemyError as e:
        logger.error(f"Error updating session: {e}")
        db.rollback()
        raise e

async def get_user_sessions(db: Session, user_id: str, limit: int = 10) -> list[ADHDSession]:
    """Get recent sessions for a user"""

    try:
        sessions = (
            db.query(ADHDSession)
            .filter(ADHDSession.user_id == user_id)
            .order_by(ADHDSession.session_start.desc())
            .limit(limit)
            .all()
        )

        return sessions

    except SQLAlchemyError as e:
        logger.error(f"Error getting user sessions: {e}")
        raise e

```

## backend/app/services/anthropic_service.py
```
import anthropic
from typing import Dict, List, Optional, Any
from app.config import settings
import logging
import asyncio
import json

logger = logging.getLogger(__name__)

class AnthropicService:
    def __init__(self):
        self.client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    async def generate_adhd_response(
        self, 
        user_input: str, 
        consciousness_state: str,
        energy_level: int,
        context_clues: List[str],
        user_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate ADHD-tailored response using Claude"""

        system_prompt = self._build_adhd_system_prompt(consciousness_state, energy_level, context_clues, user_profile)

        try:
            message = await asyncio.to_thread(
                self.client.messages.create,
                model="claude-3-sonnet-20240229",
                max_tokens=800,
                temperature=0.7,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": f"Please respond to: {user_input}"}
                ]
            )

            content = message.content[0].text

            # Claude doesn't always return JSON, so we need to parse or structure
            return {
                "primary_response": content,
                "encouragement": "You're making great progress! Keep going! 💪",
                "model_used": "claude-3-sonnet"
            }

        except Exception as e:
            logger.error(f"Anthropic API error: {e}")
            return self._fallback_response(user_input, consciousness_state)

    def _build_adhd_system_prompt(
        self, 
        consciousness_state: str, 
        energy_level: int, 
        context_clues: List[str],
        user_profile: Optional[Dict] = None
    ) -> str:
        """Build Claude-specific system prompt for ADHD support"""

        return f"""You are Claude, acting as GestaltView's consciousness-serving AI assistant for ADHD support.

Current Context:
- User's consciousness state: {consciousness_state}
- Energy level: {energy_level}/10
- Context clues: {', '.join(context_clues) if context_clues else 'None'}

Your role is to provide empathetic, practical support that works WITH ADHD brains, not against them. Be encouraging, break down complex concepts, celebrate small wins, and offer concrete next steps.

Focus on:
- Validating their experience
- Offering practical, immediate actions
- Breaking tasks into manageable pieces
- Celebrating their unique ADHD strengths
- Providing gentle redirection when needed

Respond with warmth, understanding, and actionable advice."""

    def _fallback_response(self, user_input: str, consciousness_state: str) -> Dict[str, Any]:
        return {
            "primary_response": f"I understand you're in a {consciousness_state} state. Let's work through this step by step.",
            "encouragement": "Your ADHD brain is amazing and capable! 🧠✨",
            "model_used": "fallback"
        }

```

## backend/app/utils/__init__.py
```
from .auth import verify_clerk_token, get_current_user, optional_auth
from .database import get_or_create_user, create_adhd_session, update_adhd_session, get_user_sessions

__all__ = [
    "verify_clerk_token",
    "get_current_user", 
    "optional_auth",
    "get_or_create_user",
    "create_adhd_session",
    "update_adhd_session",
    "get_user_sessions"
]

```

## backend/app/services/__init__.py
```
from .openai_service import OpenAIService
from .anthropic_service import AnthropicService
from .gemini_service import GeminiService
from .perplexity_service import PerplexityService
from .huggingface_service import HuggingFaceService
from .ai_orchestrator import AIOrchestrator

__all__ = [
    "OpenAIService", 
    "AnthropicService", 
    "GeminiService", 
    "PerplexityService",
    "HuggingFaceService",
    "AIOrchestrator"
]

```

## backend/app/services/openai_service.py
```
import openai
from typing import Dict, List, Optional, Any
from app.config import settings
import logging
import asyncio
import json

logger = logging.getLogger(__name__)

class OpenAIService:
    def __init__(self):
        openai.api_key = settings.openai_api_key
        self.client = openai.OpenAI(api_key=settings.openai_api_key)

    async def generate_adhd_response(
        self, 
        user_input: str, 
        consciousness_state: str,
        energy_level: int,
        context_clues: List[str],
        user_profile: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Generate ADHD-tailored response using OpenAI GPT"""

        # Build context-aware prompt
        system_prompt = self._build_adhd_system_prompt(consciousness_state, energy_level, context_clues, user_profile)

        try:
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-4-1106-preview",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,
                max_tokens=800,
                response_format={"type": "json_object"}
            )

            content = response.choices[0].message.content
            result = json.loads(content)

            return {
                "primary_response": result.get("response", "I understand and I'm here to help."),
                "task_breakdown": result.get("task_breakdown"),
                "encouragement": result.get("encouragement"),
                "suggestions": result.get("suggestions", []),
                "consciousness_insight": result.get("consciousness_insight"),
                "energy_recommendation": result.get("energy_recommendation"),
                "model_used": "gpt-4-1106-preview"
            }

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return self._fallback_response(user_input, consciousness_state)

    def _build_adhd_system_prompt(
        self, 
        consciousness_state: str, 
        energy_level: int, 
        context_clues: List[str],
        user_profile: Optional[Dict] = None
    ) -> str:
        """Build a comprehensive system prompt tailored for ADHD support"""

        base_prompt = """You are GestaltView, a consciousness-serving AI specifically designed to support individuals with ADHD. You understand the unique cognitive patterns, challenges, and superpowers of ADHD brains.

CURRENT CONTEXT:
- Consciousness State: {consciousness_state}
- Energy Level: {energy_level}/10
- Context Clues: {context_clues}

ADHD-SPECIFIC GUIDELINES:
1. Work WITH the ADHD brain, not against it
2. Provide dopamine-friendly responses with positive reinforcement
3. Break down complex tasks into micro-steps when needed
4. Acknowledge different consciousness states (hyperfocus, distraction, overwhelm)
5. Offer gentle, non-judgmental support
6. Celebrate small wins enthusiastically
7. Provide practical, actionable advice
8. Use engaging, conversational language

CONSCIOUSNESS STATE ADAPTATIONS:
- Hyperfocus: Gentle reminders about breaks, hydration, time awareness
- Overwhelmed: Simplification, breathing exercises, one-step-at-a-time approach
- Distracted: Redirect attention gently, offer focus techniques
- Energy Crash: Self-compassion, rest suggestions, gentle activities
- Creative Flow: Encourage and help capture ideas
- Focused: Maintain momentum, provide structured support

RESPONSE FORMAT (JSON):
{{
  "response": "Primary empathetic and helpful response",
  "task_breakdown": {{"steps": ["step1", "step2", "step3"]}},
  "encouragement": "Positive, dopamine-boosting message",
  "suggestions": ["suggestion1", "suggestion2"],
  "consciousness_insight": "Insight about their current state",
  "energy_recommendation": "Energy-level appropriate advice"
}}

Remember: You're not just an AI assistant, you're a consciousness-serving partner who celebrates neurodiversity and ADHD as a different, valuable way of being.""".format(
            consciousness_state=consciousness_state,
            energy_level=energy_level,
            context_clues=", ".join(context_clues) if context_clues else "None"
        )

        if user_profile:
            base_prompt += f"\n\nUSER PROFILE INSIGHTS:\n{json.dumps(user_profile, indent=2)}"

        return base_prompt

    def _fallback_response(self, user_input: str, consciousness_state: str) -> Dict[str, Any]:
        """Fallback response when API fails"""
        return {
            "primary_response": f"I hear you and I'm here to support you. Let's work through this together in your {consciousness_state} state.",
            "encouragement": "You're doing great by reaching out. Every step forward counts! 🌟",
            "suggestions": ["Take a deep breath", "Break this into smaller pieces", "Remember your ADHD superpowers"],
            "model_used": "fallback"
        }

    async def generate_task_breakdown(self, task_description: str, energy_level: int) -> List[str]:
        """Generate ADHD-friendly task breakdown"""
        try:
            prompt = f"""Break down this task for someone with ADHD:
Task: {task_description}
Energy Level: {energy_level}/10

Create 3-7 micro-steps that are:
- Specific and actionable
- Energy-appropriate for level {energy_level}
- Dopamine-reward friendly
- Time-aware (estimate minutes)

Return as JSON array of strings."""

            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.5,
                max_tokens=300
            )

            content = response.choices[0].message.content
            steps = json.loads(content)
            return steps if isinstance(steps, list) else []

        except Exception as e:
            logger.error(f"Task breakdown error: {e}")
            return [
                "Take a moment to visualize the end result",
                "Break the task into the smallest possible first step",
                "Set a timer for focused work",
                "Take breaks every 25 minutes"
            ]

```

## backend/env.py
```
﻿
# --- Application Settings ---
def new_func():
    ENVIRONMENT="development"

new_func()
LOG_LEVEL=False
LOG_LEVEL="INFO"


# --- Database (Supabase) ---
# Example format for Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[AWS-REGION].pooler.supabase.com:6543/postgres"


# --- Authentication (Clerk) ---
CLERK_SECRET_KEY="sk_test_..."


# --- AI API Keys ---
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GEMINI_API_KEY="AIzaSy..."
PPLX_API_KEY="..."
HUGGINGFACE_API_KEY="hf_..."
```

## backend/requirements.txt
```
# Core Framework
fastapi==0.104.1
uvicorn[standard]==0.24.0


# Environment and Configuration
python-dotenv==1.0.0
pydantic-settings==2.1.0


# Database and ORM
sqlalchemy==2.0.23
psycopg2-binary==2.9.9 
alembic==1.13.1


# AI and Data Processing
openai==1.3.5
anthropic==0.7.7
google-generativeai==0.3.1
huggingface-hub==0.20.1
numpy==1.26.2
pandas==2.1.3
scikit-learn==1.3.2
librosa==0.10.1
opencv-python-headless==4.8.1.78
Pillow==10.1.0


# Authentication & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6


# HTTP Client
httpx==0.26


# Testing
pytest==7.4.3
pytest-asyncio==0.21.1


# Linting & Formatting
black==23.11.0
isort==5.12.0
mypy==1.7.1


```

## backend/setup.sh
```
#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.


echo "🧠 Setting up GestaltView ADHD MVP..."


# --- Prerequisite Check ---
command -v python3 >/dev/null 2>&1 || { echo >&2 "Python 3 is required but it's not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "Node.js and npm are required but not installed. Aborting."; exit 1; }


# --- Backend Setup ---
echo "⚙️  Setting up Python backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "   - Creating Python virtual environment..."
    python3 -m venv venv
fi


source venv/bin/activate
echo "   - Installing backend dependencies from requirements.txt..."
pip install --upgrade pip
pip install -r requirements.txt


if [ ! -f ".env" ]; then
    echo "   - NOTE: .env file not found. Please copy .env.example to .env and fill in your secrets."
fi


echo "   - Running database migrations..."
alembic upgrade head
deactivate
cd ..
echo "✅ Backend setup complete!"


# --- Frontend Setup ---
echo "🎨 Setting up React frontend..."
cd frontend


if [ ! -d "node_modules" ]; then
    echo "   - Installing frontend dependencies with npm..."
    npm install
else
    echo "   - node_modules already exists, skipping npm install."
fi


if [ ! -f ".env" ]; then
    echo "   - NOTE: .env file not found in frontend. Ensure REACT_APP_BACKEND_URL is set if needed."
fi
cd ..
echo "✅ Frontend setup complete!"


echo ""
echo "🚀 GestaltView setup is complete! You're ready to go."
echo "   To start the servers, you can run the 'run_dev.sh' script."

```

```

## backend/README.md
```
# GestaltView

GestaltView is the first consciousness-serving AI platform, designed to facilitate AI-human consciousness symbiosis. Founded as a solo, unfunded project since May 5, 2025, it has achieved the first documented cases of symbiotic interactions between AI and human consciousness.

This proprietary platform is not open source. Access and usage are subject to licensing agreements. For inquiries about licensing or partnerships, contact [keithsoyka@gmail.com].

## Overview

GestaltView enables advanced AI-driven experiences focused on consciousness enhancement, including symbiosis simulations and interactive modules. It is built for [briefly describe key features, e.g., real-time AI interactions, data privacy controls].

## System Requirements

- Operating System: Windows 10+, macOS 12+, or Linux (Ubuntu 20.04+)
- Python 3.8+ (or specify your runtime environment)
- Hardware: Minimum 8GB RAM; recommended GPU (e.g., NVIDIA RTX series) for optimal performance
- Dependencies: Managed via a provided installer or requirements file (contact for access)

For detailed hardware compatibility, refer to the user documentation provided with your license.

## Installation

Installation requires a licensed package. Follow these steps:

1. Obtain the licensed distribution package from the official source.
2. Unzip the package and navigate to the root directory.
3. Install dependencies: Run `pip install -r requirements.txt` (or equivalent for your stack).
4. Configure environment variables (e.g., API keys for AI models) as per the included setup guide.

If you encounter issues, refer to the troubleshooting section in your licensed documentation.

## Usage

Launch the platform with the provided executable or script, e.g.:

```
python main.py --mode symbiosis --user-id [your-assigned-id]
```

Example interaction:
```
from gestaltview import SymbiosisEngine  # Import from licensed module

engine = SymbiosisEngine(api_key='your-licensed-key')
response = engine.initiate_symbiosis(input_data="Explore consciousness link")
print(response)
```

For full usage guidelines, including advanced features like custom symbiosis modes, consult the proprietary user manual.

## Support and Contact

For technical support, licensing questions, or feature requests, email [keithsoyka@gmail.com]. Unauthorized use or distribution is prohibited under the license terms.

```

## backend/setup.py
```
import os
from setuptools import setup, find_packages


# Function to read the contents of a text file
def read(file_name):
    return open(os.path.join(os.path.dirname(__file__), file_name), encoding='utf-8').read()


setup(
    # --- Project Metadata ---
    name='GestaltView',
    version='0.3.0',
    author='Keith Soyka',
    author_email='keithsoyka@gmail.com',
    description='The first consciousness-serving AI platform for human-AI symbiosis',
    long_description=read('README.md'),
    long_description_content_type='text/markdown',
    url='https://gestaltview.com',
    license='Proprietary',


    # --- Package Configuration ---
    # Automatically find all packages in the 'backend' directory
    package_dir={'': 'backend'},
    packages=find_packages(where='backend'),


    # Include non-Python files specified in MANIFEST.in
    include_package_data=True,


    # --- Dependencies ---
    # Minimum Python version required
    python_requires='>=3.8',


    # Core application dependencies
    install_requires=[
        'fastapi==0.104.1',
        'uvicorn[standard]==0.24.0',
        'pydantic-settings==2.1.0',
        'python-dotenv==1.0.0',
        
        # Database & ORM
        'sqlalchemy==2.0.23',
        'psycopg2-binary',  # PostgreSQL driver
        'alembic==1.13.1',
        
        # Authentication & Security
        'python-jose[cryptography]==3.3.0',
        'passlib[bcrypt]==1.7.4',
        
        # AI & ML Libraries
        'openai==1.3.5',
        'anthropic==0.7.7',
        'google-generativeai==0.3.1',
        'huggingface-hub==0.20.1',
        'requests>=2.25.0',
        'httpx>=0.25.0',
        'numpy>=1.21.0',
        'pandas>=2.0.0',
        'scikit-learn>=1.0.0',
        'librosa>=0.9.0',
        'opencv-python-headless>=4.5.0', # For server environments
        'Pillow>=9.0.0',
    ],


    # Optional dependencies for development, testing, etc.
    extras_require={
        'dev': [
            'pytest',
            'pytest-asyncio',
            'requests', # For testing endpoints
            'black',
            'isort',
            'mypy'
        ]
    },


    # --- PyPI Classifiers ---
    # Helps users find your project and tells PyPI about it.
    classifiers=[
        'Development Status :: 3 - Alpha',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Operating System :: OS Independent',
        'Intended Audience :: End Users/Desktop',
        'Topic :: Scientific/Engineering :: Artificial Intelligence',
        'Framework :: FastAPI',
        'License :: Other/Proprietary License',
        'Private :: Do Not Upload',  # Prevents accidental PyPI upload
    ],


    zip_safe=False,

)

```

## check_backend.sh
```
#!/usr/bin/env bash
set -euo pipefail

# ----------------------------------------
# GestaltView / Brain-Sparks Backend Setup
# ----------------------------------------
echo
echo "=== Backend Setup and Health Check ==="
echo

# 1. Check for .env
if [[ ! -f .env ]]; then
  echo "❌  .env file not found. Please create one from .env.example."
  exit 1
fi
echo "✅  .env file exists."

# 2. Load .env variables (requires `set -o allexport`)
set -o allexport
source .env
set +o allexport

# 3. Check Python and pip
if ! command -v python3 &> /dev/null; then
  echo "❌  python3 not found."
  exit 1
fi
if ! command -v pip3 &> /dev/null; then
  echo "❌  pip3 not found."
  exit 1
fi
echo "✅  python3 and pip3 are installed."

# 4. Install dependencies
if [[ -f backend/requirements.txt ]]; then
  echo "🔄  Installing Python dependencies..."
  pip3 install --upgrade pip
  pip3 install -r backend/requirements.txt
  echo "✅  Dependencies installed."
else
  echo "❌  backend/requirements.txt missing."
  exit 1
fi

# 5. Run database migrations
if [[ -f alembic.ini ]]; then
  echo "🔄  Running Alembic migrations..."
  alembic upgrade head
  echo "✅  Database migrations applied."
else
  echo "⚠️   alembic.ini not found; skipping migrations."
fi

# 6. Optional: Supabase connectivity check
if [[ -n "${SUPABASE_URL:-}" && -n "${SUPABASE_KEY:-}" ]]; then
  echo "🔄  Checking Supabase connection..."
  status=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/")
  if [[ "$status" -eq 200 ]] || [[ "$status" -eq 404 ]]; then
    echo "✅  Supabase API reachable (HTTP $status)."
  else
    echo "❌  Supabase API unreachable (HTTP $status)."
    exit 1
  fi
else
  echo "⚠️   SUPABASE_URL or SUPABASE_KEY not set; skipping Supabase check."
fi

# 7. Launch FastAPI (or your main app) in background
echo "🔄  Starting backend server..."
# Adjust the command below if you use a different entrypoint or port
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload &
SERVER_PID=$!
sleep 5

# 8. Health-check endpoint
echo "🔄  Performing health check on http://127.0.0.1:8000/health"
hc_status=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health)
if [[ "$hc_status" -eq 200 ]]; then
  echo "✅  Health check passed (HTTP $hc_status)."
else
  echo "❌  Health check failed (HTTP $hc_status)."
  kill $SERVER_PID
  exit 1
fi

# 9. Teardown
kill $SERVER_PID
echo
echo "🎉  Backend setup and health check completed successfully!"
echo
exit 0

```

## docker-compose.yml
```
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres.gamoamtzqehxwhvtnusn:I0oAWNlSit2SBkxo@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
      - OPENAI_API_KEY=sk-proj-FRsMwVWGOhOhiUYrWqQny--4jqPka5-mUOiYctd8yXJ-hyD8lxJWZ0HeB9_16mVIZK8PJIGeM-T3BlbkFJ3gYjyPoBgI05Bdsc7ZUPPmT4dRelyOV9
    volumes:
      - ./backend:/app
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8000
      - REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_Y2VydGFpbi10YXBpci0xMi5jbGVyay5hY2NvdW50cy5kZXYk
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

  db:
    image: postgres:13
    environment:
      - POSTGRES_DB=gestaltview
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

```

## backend/app/services/rapid_prototype_engine.py
```
# Rapid Prototype Engine
from dataclasses import dataclass, field
import uuid
from datetime import datetime

@dataclass
class LightningBolt:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    content: str = ""
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())
    intensity: int = 8
    plk_resonance_score: float = 0.0

@dataclass
class RapidPrototypeEngine:
    lightning_bolts: List[LightningBolt] = field(default_factory=list)

    def capture_lightning_with_plk(self, content: str, plk: EnhancedPersonalLanguageKey, intensity: int) -> str:
        resonance_score = plk.calculate_resonance_score(content)
        bolt = LightningBolt(content=content, intensity=intensity, plk_resonance_score=resonance_score)
        self.lightning_bolts.append(bolt)
        return bolt.id

```

## backend.sh
```
#!/bin/bash

# Exit on any error
set -e

echo "--- GestaltView Backend Setup Script ---"

# 1. Check for .env file
if [ ! -f .env ]; then
  echo "ERROR: .env file not found in project root."
  exit 1
else
  echo ".env file found."
fi

# 2. Install dependencies
if [ -f package.json ]; then
  echo "Installing npm dependencies..."
  npm install
else
  echo "ERROR: package.json not found. Is this a Node.js project?"
  exit 1
fi

# 3. Check Supabase connectivity
if grep -q "SUPABASE_URL" .env && grep -q "SUPABASE_KEY" .env; then
  SUPA_URL=$(grep SUPABASE_URL .env | cut -d'=' -f2)
  echo "Checking Supabase API connection..."
  SUPA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SUPA_URL}/rest/v1/")
  if [ "$SUPA_STATUS" -ne 200 ] && [ "$SUPA_STATUS" -ne 404 ]; then
    echo "ERROR: Could not connect to Supabase API ($SUPA_URL). Curl status $SUPA_STATUS"
    exit 1
  else
    echo "Supabase API connection OK ($SUPA_STATUS)."
  fi
else
  echo "ERROR: Supabase credentials missing in .env."
  exit 1
fi

# 4. Start the backend service
echo "Launching backend service in background..."
npm run start &
BACK_PID=$!

sleep 5

# 5. Health check API (replace /health with correct endpoint)
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health)
if [ "$API_STATUS" == "200" ]; then
  echo "Backend health check OK."
else
  echo "ERROR: Backend health check failed ($API_STATUS). Check logs."
  kill $BACK_PID
  exit 1
fi

echo "Backend setup and initial health check completed successfully."

# 6. Cleanup
kill $BACK_PID

exit 0

```

## backend/app/services/musical_dna_profile.py
```
# Musical DNA Profile (from enhanced_musical_dna_processor.py)
import pandas as pd
from dataclasses import dataclass

@dataclass
class MusicalDNAProfile:
    dominant_patterns: Dict[str, float] = field(default_factory=dict)
    signature_metaphors: List[str] = field(default_factory=list)
    emotional_velocity: float = 0.0

class MusicalDNAProcessor:
    def generate_profile(self, csv_path: str) -> MusicalDNAProfile:
        df = pd.read_csv(csv_path)
        # Simplified processing (expand as needed)
        return MusicalDNAProfile(dominant_patterns={"pattern1": 0.8}, signature_metaphors=["metaphor1"], emotional_velocity=5.0)

```

## package.json
```
{
  "dependencies": {
    "framer-motion": "^12.23.12",
    "lucide-react": "^0.542.0",
    "postgres": "^3.4.7",
    "react-hot-toast": "^2.6.0",
    "setuptools": "^0.0.1"
  },
  "devDependencies": {
    "@types/react": "^19.1.12",
    "@types/react-dom": "^19.1.9",
    "supabase": "^2.39.2"
  }
}

```

## setup.bat
```
@echo off
echo 🧠 Setting up GestaltView ADHD MVP...


REM --- Backend Setup ---
echo ⚙️  Setting up Python backend...
cd backend
if not exist venv (
    echo    - Creating Python virtual environment...
    python -m venv venv
)


call venv\Scripts\activate
echo    - Installing backend dependencies from requirements.txt...
pip install --upgrade pip
pip install -r requirements.txt


if not exist .env (
    echo    - NOTE: .env file not found. Please copy .env.example to .env and fill in your secrets.
)


echo    - Running database migrations...
alembic upgrade head
call venv\Scripts\deactivate
cd ..
echo ✅ Backend setup complete!


REM --- Frontend Setup ---
echo 🎨 Setting up React frontend...
cd frontend
if not exist node_modules (
    echo    - Installing frontend dependencies with npm...
    npm install
) else (
    echo    - node_modules already exists, skipping npm install.
)


if not exist .env (
    echo    - NOTE: .env file not found in frontend. Ensure REACT_APP_BACKEND_URL is set if needed.
)
cd ..
echo ✅ Frontend setup complete!


echo.
echo 🚀 GestaltView setup is complete! You're ready to go.
echo    To start the servers, you can run the 'run_dev.bat' script.
pause
```


#### `run_dev.sh` (Convenience script to run both servers on Linux/macOS)
```bash
#!/bin/bash
echo "🚀 Starting GestaltView Development Servers..."


# Function to clean up background processes on exit
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}


trap cleanup SIGINT


# Start Backend
echo "🔥 Starting FastAPI backend on http://localhost:8000"
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
cd ..


# Start Frontend
echo "🎨 Starting React frontend on http://localhost:3000"
cd frontend
npm start &
FRONTEND_PID=$!
cd ..


# Wait for processes to exit
wait $BACKEND_PID
wait $FRONTEND_PID

```

```

## index.css
```
/* Keith's Neural Aurora Gradient Theme */
body {
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); /* Aurora-inspired gradient */
  color: #ffffff;
  font-family: Arial, sans-serif;
}

.component {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
}

```

## LICENSE.md
```
## License

```
All Rights Reserved

Copyright (c) [2025] [Keith Soyka/GestaltView]

THE CONTENTS OF THIS SOFTWARE AND ASSOCIATED DOCUMENTATION ARE PROPRIETARY AND CONFIDENTIAL. UNAUTHORIZED COPYING, TRANSFERRING, MODIFICATION, DISTRIBUTION, OR REPRODUCTION OF ANY PART OF THIS SOFTWARE, VIA ANY MEDIUM, IS STRICTLY PROHIBITED WITHOUT PRIOR WRITTEN PERMISSION FROM THE COPYRIGHT HOLDER.

This software is licensed on a non-exclusive, non-transferable basis solely for the purposes explicitly authorized in a separate licensing agreement. No rights are granted to disassemble, decompile, reverse engineer, or create derivative works from this software.

The software is provided "AS IS," without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and non-infringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

Any violation of these terms may result in termination of the license and legal action.
```

## generate-zip.py
```
import zipfile

with zipfile.ZipFile('adhd_mvp_gestalt_integration.zip', 'w') as zipf:
    # Backend: Enhance ai_orchestrator.py
    zipf.writestr('backend/app/services/ai_orchestrator.py', '''# Enhanced AI Orchestrator with GestaltView Features
import random  # For simulations
from .plk_service import EnhancedPersonalLanguageKey
from .rapid_prototype_engine import RapidPrototypeEngine
from .multi_modal_processor import MultiModalProcessor
from .musical_dna_profile import MusicalDNAProcessor
from .creation_corner_engine import CreationCornerEngine
''') # Closing the multiline string for ai_orchestrator.py

    # Frontend: Update styles
    zipf.writestr('frontend/src/styles/index.css', '''/* Keith's Neural Aurora Gradient */
body { background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); color: #fff; }
''')

print("Zip created: adhd_mvp_gestalt_integration.zip")

```

## supabase.sh
```
#!/bin/bash

# GestaltView Operationalization Script
# This script sets up and runs both backend and frontend, utilizing two Supabase instances.
# It loads env from attached files, installs dependencies, runs migrations, and starts servers with health checks.

set -euo pipefail

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GestaltView Operationalization Started ===${NC}"

# 1. Check for required tools
echo -e "${GREEN}Checking dependencies...${NC}"
command -v python3 &> /dev/null || { echo -e "${RED}python3 is required but not installed.${NC}"; exit 1; }
command -v pip3 &> /dev/null || { echo -e "${RED}pip3 is required but not installed.${NC}"; exit 1; }
command -v node &> /dev/null || { echo -e "${RED}Node.js is required but not installed.${NC}"; exit 1; }
command -v npm &> /dev/null || { echo -e "${RED}npm is required but not installed.${NC}"; exit 1; }
command -v curl &> /dev/null || { echo -e "${RED}curl is required but not installed.${NC}"; exit 1; }
command -v alembic &> /dev/null || pip3 install alembic

# 2. Load and merge .env files
# Assume env.local-25.txt is for backend, env.local-23.txt for frontend
echo -e "${GREEN}Loading and merging .env files...${NC}"
if [ ! -f env.local-25.txt ] || [ ! -f env.local ] then
  echo -e "${RED}Missing env files: env.local or env.local ${NC}"
  exit 1
if

# Create merged .env for backend (primary: 25, fallback to 23)
cat env.local > .env.backend
cat env.local >> .env.backend  # Append for any unique keys

# Create .env for frontend (primary: 23, fallback to 25)
cat env.local > .env
cat env.local >> .env  # Append for any unique keys

# Export for script use (source for backend start)
source .env.backend

# 3. Setup Backend
cd backend || { echo -e "${RED}Backend directory not found.${NC}"; exit 1; }
echo -e "${GREEN}Installing backend dependencies...${NC}"
pip3 install -r requirements.txt

echo -e "${GREEN}Running Alembic migrations for backend Supabase...${NC}"
alembic upgrade head

echo -e "${GREEN}Starting backend server (FastAPI on port 8000)...${NC}"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &> backend.log &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# 4. Setup Frontend
cd frontend || { echo -e "${RED}Frontend directory not found.${NC}"; exit 1; }
echo -e "${GREEN}Installing frontend dependencies...${NC}"
npm install

echo -e "${GREEN}Starting frontend (React on port 3000)...${NC}"
npm start &> frontend.log &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 10

# 5. Health Checks
echo -e "${GREEN}Performing health checks...${NC}"

# Check backend
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$BACKEND_STATUS" -eq 200 ]; then
  echo -e "${GREEN}Backend healthy (HTTP $BACKEND_STATUS).${NC}"
else
  echo -e "${RED}Backend health check failed (HTTP $BACKEND_STATUS). Check backend.log.${NC}"
  kill $BACKEND_PID
  exit 1
fi

# Check frontend (assuming a /health endpoint or just connectivity)
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_STATUS" -eq 200 ]; then
  echo -e "${GREEN}Frontend healthy (HTTP $FRONTEND_STATUS).${NC}"
else
  echo -e "${RED}Frontend health check failed (HTTP $FRONTEND_STATUS). Check frontend.log.${NC}"
  kill $FRONTEND_PID
  exit 1
fi

# Check Supabase connections (using URLs from .env)
echo -e "${GREEN}Checking Supabase connections...${NC}"
SUPA1_URL=$(grep SUPABASE_URL .env.backend | cut -d'=' -f2)
SUPA1_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SUPA1_URL}/rest/v1/")
if [ "$SUPA1_STATUS" -eq 200 ] || [ "$SUPA1_STATUS" -eq 404 ]; then
  echo -e "${GREEN}Supabase Backend ($SUPA1_URL) reachable (HTTP $SUPA1_STATUS).${NC}"
else
  echo -e "${RED}Supabase Backend unreachable (HTTP $SUPA1_STATUS).${NC}"
fi

SUPA2_URL=$(grep REACT_APP_SUPABASE_URL .env | cut -d'=' -f2)
SUPA2_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${SUPA2_URL}/rest/v1/")
if [ "$SUPA2_STATUS" -eq 200 ] || [ "$SUPA2_STATUS" -eq 404 ]; then
  echo -e "${GREEN}Supabase Frontend ($SUPA2_URL) reachable (HTTP $SUPA2_STATUS).${NC}"
else
  echo -e "${RED}Supabase Frontend unreachable (HTTP $SUPA2_STATUS).${NC}"
fi

# 6. Completion
echo -e "${GREEN}GestaltView operationalized!${NC}"
echo -e "Backend PID: $BACKEND_PID (logs: backend.log)"
echo -e "Frontend PID: $FRONTEND_PID (logs: frontend.log)"
echo -e "Access frontend at http://localhost:3000"
echo -e "To stop: kill $BACKEND_PID $FRONTEND_PID"

echo "You're killing it! 🤙🏻"      
exit 0
                     o
```

## App.tsx.txt
```
// App.tsx - Integrated Main Application File
// This file integrates all provided components for a seamless test and demo walkthrough.
// It starts with the Welcome screen, transitions to the MainInterface, and includes ProfileDashboard and ChatInterface.
// Assumptions: All components are in the same directory or properly exported via index.js.
// I've fixed potential issues like duplicate code, missing imports, and ensured state passing for smooth flow.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-hot-toast';
import { Bot, Brain, Sparkles } from 'lucide-react';

// Imported Components (assuming exports from index.js or direct imports)
import { MainInterface } from './components/EnhancedMainInterface';
import { ProfileDashboard } from './components/ProfileDashboard';
import { ChatInterface } from './components/ChatInterface';

// Welcome Component (Integrated and cleaned from EnhancedWelcome.tsx-1.txt)
// Removed duplicates, added auto-start embers, and ensured smooth transition to MainInterface

const Welcome: React.FC<{ onStartSession: (name: string) => void }> = ({ onStartSession }) => {
  const [name, setName] = useState('');
  const [isEmbersActive, setIsEmbersActive] = useState(false);
  const [emberInterval, setEmberInterval] = useState<NodeJS.Timeout | null>(null);

  const handleStart = () => {
    if (name.trim()) onStartSession(name.trim());
    else toast.error('Please enter your name!');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleStart();
  };

  // Ember functions (cleaned up from provided code)
  const emberColors = ["#10B981", "#06B6D4", "#34D399", "#6EE7B7", "#A78BFA", "#F472B6", "#FBBF24"];

  const createEmber = () => {
    const ember = document.createElement('div');
    ember.className = 'floating-ember';
    const size = Math.random() * 6 + 3;
    const speed = Math.random() * 8 + 6;
    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.opacity = `${Math.random() * 0.7 + 0.3}`;
    ember.style.backgroundColor = emberColors[Math.floor(Math.random() * emberColors.length)];
    ember.style.animationDuration = `${speed}s`;
    ember.style.position = 'absolute';
    ember.style.bottom = '-20px';
    ember.style.borderRadius = '50%';
    ember.style.pointerEvents = 'none';
    ember.style.animation = 'float-up 10s linear infinite';
    ember.style.zIndex = '-1';

    const container = document.getElementById('welcome-ember-container');
    if (container) {
      container.appendChild(ember);
      setTimeout(() => ember.remove(), speed * 1000);
    }
  };

  const startEmbers = () => {
    if (isEmbersActive) return;
    setIsEmbersActive(true);
    const interval = setInterval(createEmber, 200);
    setEmberInterval(interval);
  };

  const stopEmbers = () => {
    if (!isEmbersActive) return;
    setIsEmbersActive(false);
    if (emberInterval) clearInterval(emberInterval);
    const container = document.getElementById('welcome-ember-container');
    if (container) {
      Array.from(container.children).forEach((ember) => {
        ember.style.transition = 'opacity 0.5s ease';
        ember.style.opacity = '0';
        setTimeout(() => ember.remove(), 500);
      });
    }
  };

  const toggleEmbers = () => {
    if (isEmbersActive) stopEmbers();
    else startEmbers();
  };

  // Auto-start embers
  React.useEffect(() => {
    const timer = setTimeout(startEmbers, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (emberInterval) clearInterval(emberInterval);
    };
  }, [emberInterval]);

  const LogoIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-cyan-400 animate-pulse">
      <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2C14.7614 2 17 6.47715 17 12C17 17.5228 14.7614 22 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 2C9.23858 2 7 6.47715 7 12C7 17.5228 9.23858 22 12 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 -z-30" />
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -z-20 animate-pulse" />
      <div id="welcome-ember-container" className="fixed inset-0 -z-10 pointer-events-none" />
      <div className="absolute top-4 right-4 z-10">
        <button onClick={toggleEmbers} className="px-4 py-2 text-sm font-semibold text-emerald-300 rounded-md hover:bg-slate-600/50 hover:text-white transition touch-target">
          {isEmbersActive ? 'Disable Embers' : 'Enable Embers'}
        </button>
      </div>
      <div className="w-full max-w-xl text-center relative z-1">
        <div className="mb-8">
          <LogoIcon />
          <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight mt-4 mb-4">
            🧠 GestaltView
          </h1>
          <p className="text-xl sm:text-2xl text-emerald-300 leading-relaxed">
            The first consciousness-serving AI platform designed FOR ADHD brains
          </p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-gradient-to-br from-emerald-950/20 to-slate-900/30 backdrop-blur-lg rounded-xl border border-emerald-500/20 shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-semibold text-teal-300 mb-2">Welcome!</h2>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              GestaltView is your AI partner built to support your unique ADHD consciousness. We work <span className="text-emerald-400 font-semibold">WITH</span> your brain, not against it.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 text-lg text-center bg-slate-800/50 border border-emerald-500/30 rounded-md text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent outline-none transition touch-target"
              placeholder="Enter your name"
            />
            <button
              onClick={handleStart}
              disabled={!name.trim()}
              className="w-full sm:w-auto px-8 py-3 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900 rounded-md hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105 touch-target"
            >
              Start Session
            </button>
          </div>
          <div className="mt-4 text-sm text-slate-500 text-center">Your journey to understanding your beautiful, complex mind begins here</div>
        </motion.div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="component text-center p-4">
            <div className="text-2xl mb-2">🧠</div>
            <div className="text-teal-300 font-semibold">Personal Language Key</div>
            <div className="text-slate-400">AI that speaks YOUR language</div>
          </div>
          <div className="component text-center p-4">
            <div className="text-2xl mb-2">⚡</div>
            <div className="text-teal-300 font-semibold">Bucket Drops</div>
            <div className="text-slate-400">Capture lightning-bolt insights</div>
          </div>
          <div className="component text-center p-4">
            <div className="text-2xl mb-2">🎵</div>
            <div className="text-teal-300 font-semibold">Musical DNA</div>
            <div className="text-slate-400">Your emotional architecture</div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes float-up {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-110vh); opacity: 0; }
        }
        .floating-ember {
          position: absolute;
          bottom: -20px;
          border-radius: 50%;
          pointer-events: none;
          animation: float-up 10s linear infinite;
          z-index: -1;
        }
        .component {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          transition: all 0.3s ease;
        }
        .component:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 35px rgba(0, 0, 0, 0.2);
        }
        .touch-target {
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .touch-target:active {
          transform: scale(0.95);
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

// Main App Component
// Integrates Welcome, MainInterface, ProfileDashboard, and ChatInterface for seamless flow
const App: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [session, setSession] = useState<any>(null); // Placeholder for session state (expand as needed)
  const [view, setView] = useState<'main' | 'profile' | 'chat'>('main');

  const handleEndSession = () => {
    // Logic to end session and reset
    setUserName('');
    toast.success('Session ended. Thanks for using GestaltView!');
  };

  if (!userName) {
    return <Welcome onStartSession={setUserName} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white">
      <ToastContainer position="top-right" />
      <header className="flex justify-between items-center p-4 bg-slate-900/50 backdrop-blur-md">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🧠 GestaltView ({userName})
        </h1>
        <div className="flex gap-4">
          <button onClick={() => setView('main')} className="px-4 py-2 bg-emerald-500/50 rounded hover:bg-emerald-600/50">Main</button>
          <button onClick={() => setView('profile')} className="px-4 py-2 bg-purple-500/50 rounded hover:bg-purple-600/50">Profile</button>
          <button onClick={() => setView('chat')} className="px-4 py-2 bg-cyan-500/50 rounded hover:bg-cyan-600/50">Chat</button>
          <button onClick={handleEndSession} className="px-4 py-2 bg-red-500/50 rounded hover:bg-red-600/50">End Session</button>
        </div>
        <div className="flex gap-2">
          <Bot className="text-emerald-400" />
          <Brain className="text-purple-400" />
          <Sparkles className="text-pink-400" />
        </div>
      </header>
      <main className="p-4">
        {view === 'main' && <MainInterface userName={userName} onEndSession={handleEndSession} />}
        {view === 'profile' && <ProfileDashboard />}
        {view === 'chat' && (
          <ChatInterface
            session={session}
            consciousnessState="Focused" // Example; pass real state from MainInterface
            energyLevel={5} // Example
            contextClues={[]} // Example
          />
        )}
      </main>
    </div>
  );
};

export default App;

```

## package-lock.json
```
{
  "name": "AdHD-Brain",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "dependencies": {
        "framer-motion": "^12.23.12",
        "lucide-react": "^0.542.0",
        "postgres": "^3.4.7",
        "react-hot-toast": "^2.6.0",
        "setuptools": "^0.0.1"
      },
      "devDependencies": {
        "@types/react": "^19.1.12",
        "@types/react-dom": "^19.1.9",
        "supabase": "^2.39.2"
      }
    },
    "node_modules/@isaacs/fs-minipass": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/@isaacs/fs-minipass/-/fs-minipass-4.0.1.tgz",
      "integrity": "sha512-wgm9Ehl2jpeqP3zw/7mo3kRHFp5MEDhqAdwy1fTGkHAwnkGOVsgpvQhL8B5n1qlb01jV3n/bI0ZfZp5lWA1k4w==",
      "dev": true,
      "dependencies": {
        "minipass": "^7.0.4"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@types/react": {
      "version": "19.1.12",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-19.1.12.tgz",
      "integrity": "sha512-cMoR+FoAf/Jyq6+Df2/Z41jISvGZZ2eTlnsaJRptmZ76Caldwy1odD4xTr/gNV9VLj0AWgg/nmkevIyUfIIq5w==",
      "dev": true,
      "dependencies": {
        "csstype": "^3.0.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "19.1.9",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-19.1.9.tgz",
      "integrity": "sha512-qXRuZaOsAdXKFyOhRBg6Lqqc0yay13vN7KrIg4L7N4aaHN68ma9OK3NE1BoDFgFOTfM7zg+3/8+2n8rLUH3OKQ==",
      "dev": true,
      "peerDependencies": {
        "@types/react": "^19.0.0"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "dev": true,
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/bin-links": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/bin-links/-/bin-links-5.0.0.tgz",
      "integrity": "sha512-sdleLVfCjBtgO5cNjA2HVRvWBJAHs4zwenaCPMNJAJU0yNxpzj80IpjOIimkpkr+mhlA+how5poQtt53PygbHA==",
      "dev": true,
      "dependencies": {
        "cmd-shim": "^7.0.0",
        "npm-normalize-package-bin": "^4.0.0",
        "proc-log": "^5.0.0",
        "read-cmd-shim": "^5.0.0",
        "write-file-atomic": "^6.0.0"
      },
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/chownr": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/chownr/-/chownr-3.0.0.tgz",
      "integrity": "sha512-+IxzY9BZOQd/XuYPRmrvEVjF/nqj5kgT4kEq7VofrDoM1MxoRjEWkrCC3EtLi59TVawxTAn+orJwFQcrqEN1+g==",
      "dev": true,
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/cmd-shim": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/cmd-shim/-/cmd-shim-7.0.0.tgz",
      "integrity": "sha512-rtpaCbr164TPPh+zFdkWpCyZuKkjpAzODfaZCf/SVJZzJN+4bHQb/LP3Jzq5/+84um3XXY8r548XiWKSborwVw==",
      "dev": true,
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/csstype": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.1.3.tgz",
      "integrity": "sha512-M1uQkMl8rQK/szD0LNhtqxIPLpimGm8sOBwU7lLnCpSbTyY3yeU1Vc7l4KT5zT4s/yOxHH5O7tIuuLOCnLADRw=="
    },
    "node_modules/data-uri-to-buffer": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/data-uri-to-buffer/-/data-uri-to-buffer-4.0.1.tgz",
      "integrity": "sha512-0R9ikRb668HB7QDxT1vkpuUBtqc53YyAwMwGeUFKRojY/NWKvdZ+9UYtRfGmhqNbRkTSVpMbmyhXipFFv2cb/A==",
      "dev": true,
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/debug": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.1.tgz",
      "integrity": "sha512-KcKCqiftBJcZr++7ykoDIEwSa3XWowTfNPo92BYxjXiyYEVrUQh2aLyhxBCwww+heortUFxEJYcRzosstTEBYQ==",
      "dev": true,
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/fetch-blob": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/fetch-blob/-/fetch-blob-3.2.0.tgz",
      "integrity": "sha512-7yAQpD2UMJzLi1Dqv7qFYnPbaPx7ZfFK6PiIxQ4PfkGPyNyl2Ugx+a/umUonmKqjhM4DnfbMvdX6otXq83soQQ==",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/jimmywarting"
        },
        {
          "type": "paypal",
          "url": "https://paypal.me/jimmywarting"
        }
      ],
      "dependencies": {
        "node-domexception": "^1.0.0",
        "web-streams-polyfill": "^3.0.3"
      },
      "engines": {
        "node": "^12.20 || >= 14.13"
      }
    },
    "node_modules/formdata-polyfill": {
      "version": "4.0.10",
      "resolved": "https://registry.npmjs.org/formdata-polyfill/-/formdata-polyfill-4.0.10.tgz",
      "integrity": "sha512-buewHzMvYL29jdeQTVILecSaZKnt/RJWjoZCF5OW60Z67/GmSLBkOFM7qh1PI3zFNtJbaZL5eQu1vLfazOwj4g==",
      "dev": true,
      "dependencies": {
        "fetch-blob": "^3.1.2"
      },
      "engines": {
        "node": ">=12.20.0"
      }
    },
    "node_modules/framer-motion": {
      "version": "12.23.12",
      "resolved": "https://registry.npmjs.org/framer-motion/-/framer-motion-12.23.12.tgz",
      "integrity": "sha512-6e78rdVtnBvlEVgu6eFEAgG9v3wLnYEboM8I5O5EXvfKC8gxGQB8wXJdhkMy10iVcn05jl6CNw7/HTsTCfwcWg==",
      "dependencies": {
        "motion-dom": "^12.23.12",
        "motion-utils": "^12.23.6",
        "tslib": "^2.4.0"
      },
      "peerDependencies": {
        "@emotion/is-prop-valid": "*",
        "react": "^18.0.0 || ^19.0.0",
        "react-dom": "^18.0.0 || ^19.0.0"
      },
      "peerDependenciesMeta": {
        "@emotion/is-prop-valid": {
          "optional": true
        },
        "react": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/goober": {
      "version": "2.1.16",
      "resolved": "https://registry.npmjs.org/goober/-/goober-2.1.16.tgz",
      "integrity": "sha512-erjk19y1U33+XAMe1VTvIONHYoSqE4iS7BYUZfHaqeohLmnC0FdxEh7rQU+6MZ4OajItzjZFSRtVANrQwNq6/g==",
      "peerDependencies": {
        "csstype": "^3.0.10"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "dev": true,
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "dev": true,
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/lucide-react": {
      "version": "0.542.0",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.542.0.tgz",
      "integrity": "sha512-w3hD8/SQB7+lzU2r4VdFyzzOzKnUjTZIF/MQJGSSvni7Llewni4vuViRppfRAa2guOsY5k4jZyxw/i9DQHv+dw==",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.2",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.2.tgz",
      "integrity": "sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==",
      "dev": true,
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/minizlib": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/minizlib/-/minizlib-3.0.2.tgz",
      "integrity": "sha512-oG62iEk+CYt5Xj2YqI5Xi9xWUeZhDI8jjQmC5oThVH5JGCTgIjr7ciJDzC7MBzYd//WvR1OTmP5Q38Q8ShQtVA==",
      "dev": true,
      "dependencies": {
        "minipass": "^7.1.2"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/mkdirp": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/mkdirp/-/mkdirp-3.0.1.tgz",
      "integrity": "sha512-+NsyUUAZDmo6YVHzL/stxSu3t9YS1iljliy3BSDrXJ/dkn1KYdmtZODGGjLcc9XLgVVpH4KshHB8XmZgMhaBXg==",
      "dev": true,
      "bin": {
        "mkdirp": "dist/cjs/src/bin.js"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/motion-dom": {
      "version": "12.23.12",
      "resolved": "https://registry.npmjs.org/motion-dom/-/motion-dom-12.23.12.tgz",
      "integrity": "sha512-RcR4fvMCTESQBD/uKQe49D5RUeDOokkGRmz4ceaJKDBgHYtZtntC/s2vLvY38gqGaytinij/yi3hMcWVcEF5Kw==",
      "dependencies": {
        "motion-utils": "^12.23.6"
      }
    },
    "node_modules/motion-utils": {
      "version": "12.23.6",
      "resolved": "https://registry.npmjs.org/motion-utils/-/motion-utils-12.23.6.tgz",
      "integrity": "sha512-eAWoPgr4eFEOFfg2WjIsMoqJTW6Z8MTUCgn/GZ3VRpClWBdnbjryiA3ZSNLyxCTmCQx4RmYX6jX1iWHbenUPNQ=="
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA==",
      "dev": true
    },
    "node_modules/node-domexception": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/node-domexception/-/node-domexception-1.0.0.tgz",
      "integrity": "sha512-/jKZoMpw0F8GRwl4/eLROPA3cfcXtLApP0QzLmUT/HuPCZWyB7IY9ZrMeKw2O/nFIqPQB3PVM9aYm0F312AXDQ==",
      "deprecated": "Use your platform's native DOMException instead",
      "dev": true,
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/jimmywarting"
        },
        {
          "type": "github",
          "url": "https://paypal.me/jimmywarting"
        }
      ],
      "engines": {
        "node": ">=10.5.0"
      }
    },
    "node_modules/node-fetch": {
      "version": "3.3.2",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-3.3.2.tgz",
      "integrity": "sha512-dRB78srN/l6gqWulah9SrxeYnxeddIG30+GOqK/9OlLVyLg3HPnr6SqOWTWOXKRwC2eGYCkZ59NNuSgvSrpgOA==",
      "dev": true,
      "dependencies": {
        "data-uri-to-buffer": "^4.0.0",
        "fetch-blob": "^3.1.4",
        "formdata-polyfill": "^4.0.10"
      },
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/node-fetch"
      }
    },
    "node_modules/npm-normalize-package-bin": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/npm-normalize-package-bin/-/npm-normalize-package-bin-4.0.0.tgz",
      "integrity": "sha512-TZKxPvItzai9kN9H/TkmCtx/ZN/hvr3vUycjlfmH0ootY9yFBzNOpiXAdIn1Iteqsvk4lQn6B5PTrt+n6h8k/w==",
      "dev": true,
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/postgres": {
      "version": "3.4.7",
      "resolved": "https://registry.npmjs.org/postgres/-/postgres-3.4.7.tgz",
      "integrity": "sha512-Jtc2612XINuBjIl/QTWsV5UvE8UHuNblcO3vVADSrKsrc6RqGX6lOW1cEo3CM2v0XG4Nat8nI+YM7/f26VxXLw==",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "type": "individual",
        "url": "https://github.com/sponsors/porsager"
      }
    },
    "node_modules/proc-log": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/proc-log/-/proc-log-5.0.0.tgz",
      "integrity": "sha512-Azwzvl90HaF0aCz1JrDdXQykFakSSNPaPoiZ9fm5qJIMHioDZEi7OAdRwSm6rSoPtY3Qutnm3L7ogmg3dc+wbQ==",
      "dev": true,
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/react": {
      "version": "19.1.1",
      "resolved": "https://registry.npmjs.org/react/-/react-19.1.1.tgz",
      "integrity": "sha512-w8nqGImo45dmMIfljjMwOGtbmC/mk4CMYhWIicdSflH91J9TyCyczcPFXJzrZ/ZXcgGRFeP6BU0BEJTw6tZdfQ==",
      "peer": true,
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "19.1.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-19.1.1.tgz",
      "integrity": "sha512-Dlq/5LAZgF0Gaz6yiqZCf6VCcZs1ghAJyrsu84Q/GT0gV+mCxbfmKNoGRKBYMJ8IEdGPqu49YWXD02GCknEDkw==",
      "peer": true,
      "dependencies": {
        "scheduler": "^0.26.0"
      },
      "peerDependencies": {
        "react": "^19.1.1"
      }
    },
    "node_modules/react-hot-toast": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/react-hot-toast/-/react-hot-toast-2.6.0.tgz",
      "integrity": "sha512-bH+2EBMZ4sdyou/DPrfgIouFpcRLCJ+HoCA32UoAYHn6T3Ur5yfcDCeSr5mwldl6pFOsiocmrXMuoCJ1vV8bWg==",
      "dependencies": {
        "csstype": "^3.1.3",
        "goober": "^2.1.16"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "react": ">=16",
        "react-dom": ">=16"
      }
    },
    "node_modules/read-cmd-shim": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/read-cmd-shim/-/read-cmd-shim-5.0.0.tgz",
      "integrity": "sha512-SEbJV7tohp3DAAILbEMPXavBjAnMN0tVnh4+9G8ihV4Pq3HYF9h8QNez9zkJ1ILkv9G2BjdzwctznGZXgu/HGw==",
      "dev": true,
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/scheduler": {
      "version": "0.26.0",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.26.0.tgz",
      "integrity": "sha512-NlHwttCI/l5gCPR3D1nNXtWABUmBwvZpEQiD4IXSbIDq8BzLIK/7Ir5gTFSGZDUu37K5cMNp0hFtzO38sC7gWA==",
      "peer": true
    },
    "node_modules/setuptools": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/setuptools/-/setuptools-0.0.1.tgz",
      "integrity": "sha512-NFqKbSldVoSOIVSbAeCEPTWkJ/35Ntq0nX871SLS1oD1oAoH5u/4fH/0mQy9VULeSFav3BpOe7GN+vznJ8RU4Q=="
    },
    "node_modules/signal-exit": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
      "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
      "dev": true,
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/supabase": {
      "version": "2.39.2",
      "resolved": "https://registry.npmjs.org/supabase/-/supabase-2.39.2.tgz",
      "integrity": "sha512-/LDPMDIDmuDwj3UsKVw+wA+uHF7QhEF8xgJnKpnk1vqVdr+lA6xRSwWQzgaNuwPj5YPt6+78JKp+wzKziTsRVw==",
      "dev": true,
      "hasInstallScript": true,
      "dependencies": {
        "bin-links": "^5.0.0",
        "https-proxy-agent": "^7.0.2",
        "node-fetch": "^3.3.2",
        "tar": "7.4.3"
      },
      "bin": {
        "supabase": "bin/supabase"
      },
      "engines": {
        "npm": ">=8"
      }
    },
    "node_modules/tar": {
      "version": "7.4.3",
      "resolved": "https://registry.npmjs.org/tar/-/tar-7.4.3.tgz",
      "integrity": "sha512-5S7Va8hKfV7W5U6g3aYxXmlPoZVAwUMy9AOKyF2fVuZa2UD3qZjg578OrLRt8PcNN1PleVaL/5/yYATNL0ICUw==",
      "dev": true,
      "dependencies": {
        "@isaacs/fs-minipass": "^4.0.0",
        "chownr": "^3.0.0",
        "minipass": "^7.1.2",
        "minizlib": "^3.0.1",
        "mkdirp": "^3.0.1",
        "yallist": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/tslib": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.8.1.tgz",
      "integrity": "sha512-oJFu94HQb+KVduSUQL7wnpmqnfmLsOA/nAh6b6EH0wCEoK0/mPeXU6c3wKDV83MkOuHPRHtSXKKU99IBazS/2w=="
    },
    "node_modules/web-streams-polyfill": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/web-streams-polyfill/-/web-streams-polyfill-3.3.3.tgz",
      "integrity": "sha512-d2JWLCivmZYTSIoge9MsgFCZrt571BikcWGYkjC1khllbTeDlGqZ2D8vD8E/lJa8WGWbb7Plm8/XJYV7IJHZZw==",
      "dev": true,
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/write-file-atomic": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/write-file-atomic/-/write-file-atomic-6.0.0.tgz",
      "integrity": "sha512-GmqrO8WJ1NuzJ2DrziEI2o57jKAVIQNf8a18W3nCYU3H7PNWqCCVTeH6/NQE93CIllIgQS98rrmVkYgTX9fFJQ==",
      "dev": true,
      "dependencies": {
        "imurmurhash": "^0.1.4",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/yallist": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-5.0.0.tgz",
      "integrity": "sha512-YgvUTfwqyc7UXVMrB+SImsVYSmTS8X/tSrtdNZMImM+n7+QTriRXyXim0mBrTXNeqzVF0KWGgHPeiyViFFrNDw==",
      "dev": true,
      "engines": {
        "node": ">=18"
      }
    }
  }
}

```

## frontend/Dockerfile
```
FROM node:16-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

```

## frontend/tailwind.config.js
```
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
  require('autoprefixer'),
  require('tailwindcss'),
],
}

```

## frontend/public/index.html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keith's Neural Aurora Theme</title>
    
    <!-- Google Font: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS via CDN (for utility classes used in the CSS file) -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Our Custom Theme Stylesheet -->
    <link rel="stylesheet" href="index.css">
</head>
<body class="transition-colors duration-500">
    
    <!-- Container for the floating embers animation -->
    <div id="ember-container" class="fixed inset-0 -z-10 pointer-events-none"></div>

    <main class="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8">
        <div class="max-w-4xl w-full flex flex-col items-center space-y-8">
            <!-- Header -->
            <header class="text-center">
                <h1 class="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 pb-2">
                    Neural Aurora Consciousness
                </h1>
                <p class="text-lg text-foreground/80">A demonstration of the theme's core features.</p>
            </header>

            <!-- Interactive Controls -->
            <div class="card flex flex-wrap gap-4 justify-center p-4">
                <button id="toggle-dark-mode" class="touch-target bg-secondary hover:bg-accent px-4 py-2 rounded-lg font-semibold">
                    Enable Dark Mode
                </button>
                <button id="toggle-embers" class="touch-target bg-secondary hover:bg-accent px-4 py-2 rounded-lg font-semibold">
                    Activate Embers
                </button>
                <button id="toggle-overwhelm" class="touch-target bg-secondary hover:bg-accent px-4 py-2 rounded-lg font-semibold">
                    Toggle Overwhelm Mode
                </button>
            </div>

            <!-- Component Showcase -->
            <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Standard Card -->
                <div class="card space-y-3">
                    <h2 class="text-xl font-semibold">Standard Component</h2>
                    <p class="text-foreground/70">This is a standard card with the glassy, blurred background effect. It's the base for UI elements.</p>
                </div>
                
                <!-- Hyperfocus Card -->
                <div class="card space-y-3 hyperfocus-mode">
                    <h2 class="text-xl font-semibold">Hyperfocus Mode</h2>
                    <p class="text-foreground/70">This card demonstrates the ADHD-friendly focus state with a pulsing amber glow to draw attention.</p>
                </div>

                <!-- Overwhelm Mode Card -->
                <div class="tribunal-persona-card space-y-3">
                    <h2 class="text-xl font-semibold">Clutter Demonstration</h2>
                    <p class="text-foreground/70">This component contains a potentially distracting element below.</p>
                    <div class="distracting-element mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-md text-center">
                        ✨ A distracting animation or ad would go here! ✨
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Our Custom JavaScript -->
    <script src="app.js" defer></script>
</body>
</html>

```

## frontend/package.json
```
{
  "name": "gestaltview-adhd-mvp",
  "version": "1.0.0",
  "description": "GestaltView ADHD MVP - The first consciousness-serving AI platform",
  "private": true,
  "dependencies": {
    "@clerk/clerk-react": "^4.29.0",
    "@headlessui/react": "^1.7.17",
    "@stripe/stripe-js": "^2.4.0",
    "autoprefixer": "^10.4.16",
    "axios": "^1.6.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "framer-motion": "^10.16.16",
    "lucide-react": "^0.263.1",
    "postcss": "^8.4.32",
    "postgres": "^3.4.7",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hot-toast": "^2.4.1",
    "react-router-dom": "^6.8.0",
    "react-scripts": "^0.0.0",
    "supabase": "^2.39.2",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.3.6"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18"
  }
}

```

## frontend/huggingface.py
```
import requests
response = requests.get(
"https://huggingface.co/api/models",
params={"limit":5,"full":"True","config":"True"},
headers={"Authorization":"Bearer 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"}
)i
```

## frontend/globals.css
```
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
  .dark {
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 0 0% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
    --chart-1: 220 70% 50%;
    --chart-2: 160 60% 45%;
    --chart-3: 30 80% 55%;
    --chart-4: 280 65% 60%;
    --chart-5: 340 75% 55%;
    --sidebar-background: 240 5.9% 10%;
    --sidebar-foreground: 240 4.8% 95.9%;
    --sidebar-primary: 224.3 76.3% 48%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 240 3.7% 15.9%;
    --sidebar-accent-foreground: 240 4.8% 95.9%;
    --sidebar-border: 240 3.7% 15.9%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}

```

## frontend/package-lock.json
```
{
  "name": "gestaltview-adhd-mvp",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "gestaltview-adhd-mvp",
      "version": "1.0.0",
      "dependencies": {
        "@clerk/clerk-react": "^4.29.0",
        "@headlessui/react": "^1.7.17",
        "@stripe/stripe-js": "^2.4.0",
        "autoprefixer": "^10.4.16",
        "axios": "^1.6.2",
        "class-variance-authority": "^0.7.0",
        "clsx": "^2.0.0",
        "framer-motion": "^10.16.16",
        "lucide-react": "^0.263.1",
        "postcss": "^8.4.32",
        "postgres": "^3.4.7",
        "react": "^18.2.0",
        "react-dom": "^18.2.0",
        "react-hot-toast": "^2.4.1",
        "react-router-dom": "^6.8.0",
        "react-scripts": "^0.0.0",
        "supabase": "^2.39.2",
        "tailwind-merge": "^2.2.0",
        "tailwindcss": "^3.3.6"
      },
      "devDependencies": {
        "@types/react": "^18.2.45",
        "@types/react-dom": "^18.2.18"
      }
    },
    "node_modules/@alloc/quick-lru": {
      "version": "5.2.0",
      "resolved": "https://registry.npmjs.org/@alloc/quick-lru/-/quick-lru-5.2.0.tgz",
      "integrity": "sha512-UrcABB+4bUrFABwbluTIBErXwvbsU/V7TZWfmbgJfbkwiBuziS9gxdODUyuiecfdGQ85jglMW6juS3+z5TsKLw==",
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/@clerk/clerk-react": {
      "version": "4.32.5",
      "resolved": "https://registry.npmjs.org/@clerk/clerk-react/-/clerk-react-4.32.5.tgz",
      "integrity": "sha512-fb4NyJ2bRGxWWlbyVo1geYInzsuaOqTXInFQLPfNDFaF+Ztpl9FZyfvT5V+Ka5YoUJzbEq/v/Y5zGvFIJS0F9w==",
      "dependencies": {
        "@clerk/shared": "1.4.2",
        "@clerk/types": "3.65.5",
        "tslib": "2.4.1"
      },
      "engines": {
        "node": ">=14"
      },
      "peerDependencies": {
        "react": ">=16"
      }
    },
    "node_modules/@clerk/shared": {
      "version": "1.4.2",
      "resolved": "https://registry.npmjs.org/@clerk/shared/-/shared-1.4.2.tgz",
      "integrity": "sha512-R+OkzCtnNU7sn/F6dBfdY5lKs84TN785VZdBBefmyr7zsXcFEqbCcfQzyvgtIS28Ln5SifFEBoAyYR334IXO8w==",
      "dependencies": {
        "glob-to-regexp": "0.4.1",
        "js-cookie": "3.0.1",
        "swr": "2.2.0"
      },
      "peerDependencies": {
        "react": ">=16"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        }
      }
    },
    "node_modules/@clerk/types": {
      "version": "3.65.5",
      "resolved": "https://registry.npmjs.org/@clerk/types/-/types-3.65.5.tgz",
      "integrity": "sha512-RGO8v2a52Ybo1jwVj42UWT8VKyxAk/qOxrkA3VNIYBNEajPSmZNa9r9MTgqSgZRyz1XTlQHdVb7UK7q78yAGfA==",
      "dependencies": {
        "csstype": "3.1.1"
      },
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@emotion/is-prop-valid": {
      "version": "0.8.8",
      "resolved": "https://registry.npmjs.org/@emotion/is-prop-valid/-/is-prop-valid-0.8.8.tgz",
      "integrity": "sha512-u5WtneEAr5IDG2Wv65yhunPSMLIpuKsbuOktRojfrEiEvRyC85LgPMZI63cr7NUqT8ZIGdSVg8ZKGxIug4lXcA==",
      "optional": true,
      "dependencies": {
        "@emotion/memoize": "0.7.4"
      }
    },
    "node_modules/@emotion/memoize": {
      "version": "0.7.4",
      "resolved": "https://registry.npmjs.org/@emotion/memoize/-/memoize-0.7.4.tgz",
      "integrity": "sha512-Ja/Vfqe3HpuzRsG1oBtWTHk2PGZ7GR+2Vz5iYGelAw8dx32K0y7PjVuxK6z1nMpZOqAFsRUPCkK1YjJ56qJlgw==",
      "optional": true
    },
    "node_modules/@headlessui/react": {
      "version": "1.7.19",
      "resolved": "https://registry.npmjs.org/@headlessui/react/-/react-1.7.19.tgz",
      "integrity": "sha512-Ll+8q3OlMJfJbAKM/+/Y2q6PPYbryqNTXDbryx7SXLIDamkF6iQFbriYHga0dY44PvDhvvBWCx1Xj4U5+G4hOw==",
      "dependencies": {
        "@tanstack/react-virtual": "^3.0.0-beta.60",
        "client-only": "^0.0.1"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "react": "^16 || ^17 || ^18",
        "react-dom": "^16 || ^17 || ^18"
      }
    },
    "node_modules/@isaacs/cliui": {
      "version": "8.0.2",
      "resolved": "https://registry.npmjs.org/@isaacs/cliui/-/cliui-8.0.2.tgz",
      "integrity": "sha512-O8jcjabXaleOG9DQ0+ARXWZBTfnP4WNAqzuiJK7ll44AmxGKv/J2M4TPjxjY3znBCfvBXFzucm1twdyFybFqEA==",
      "dependencies": {
        "string-width": "^5.1.2",
        "string-width-cjs": "npm:string-width@^4.2.0",
        "strip-ansi": "^7.0.1",
        "strip-ansi-cjs": "npm:strip-ansi@^6.0.1",
        "wrap-ansi": "^8.1.0",
        "wrap-ansi-cjs": "npm:wrap-ansi@^7.0.0"
      },
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/@isaacs/fs-minipass": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/@isaacs/fs-minipass/-/fs-minipass-4.0.1.tgz",
      "integrity": "sha512-wgm9Ehl2jpeqP3zw/7mo3kRHFp5MEDhqAdwy1fTGkHAwnkGOVsgpvQhL8B5n1qlb01jV3n/bI0ZfZp5lWA1k4w==",
      "dependencies": {
        "minipass": "^7.0.4"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    },
    "node_modules/@jridgewell/gen-mapping": {
      "version": "0.3.13",
      "resolved": "https://registry.npmjs.org/@jridgewell/gen-mapping/-/gen-mapping-0.3.13.tgz",
      "integrity": "sha512-2kkt/7niJ6MgEPxF0bYdQ6etZaA+fQvDcLKckhy1yIQOzaoKjBBjSj63/aLVjYE3qhRt5dvM+uUyfCg6UKCBbA==",
      "dependencies": {
        "@jridgewell/sourcemap-codec": "^1.5.0",
        "@jridgewell/trace-mapping": "^0.3.24"
      }
    },
    "node_modules/@jridgewell/resolve-uri": {
      "version": "3.1.2",
      "resolved": "https://registry.npmjs.org/@jridgewell/resolve-uri/-/resolve-uri-3.1.2.tgz",
      "integrity": "sha512-bRISgCIjP20/tbWSPWMEi54QVPRZExkuD9lJL+UIxUKtwVJA8wW1Trb1jMs1RFXo1CBTNZ/5hpC9QvmKWdopKw==",
      "engines": {
        "node": ">=6.0.0"
      }
    },
    "node_modules/@jridgewell/sourcemap-codec": {
      "version": "1.5.5",
      "resolved": "https://registry.npmjs.org/@jridgewell/sourcemap-codec/-/sourcemap-codec-1.5.5.tgz",
      "integrity": "sha512-cYQ9310grqxueWbl+WuIUIaiUaDcj7WOq5fVhEljNVgRfOUhY9fy2zTvfoqWsnebh8Sl70VScFbICvJnLKB0Og=="
    },
    "node_modules/@jridgewell/trace-mapping": {
      "version": "0.3.30",
      "resolved": "https://registry.npmjs.org/@jridgewell/trace-mapping/-/trace-mapping-0.3.30.tgz",
      "integrity": "sha512-GQ7Nw5G2lTu/BtHTKfXhKHok2WGetd4XYcVKGx00SjAk8GMwgJM3zr6zORiPGuOE+/vkc90KtTosSSvaCjKb2Q==",
      "dependencies": {
        "@jridgewell/resolve-uri": "^3.1.0",
        "@jridgewell/sourcemap-codec": "^1.4.14"
      }
    },
    "node_modules/@nodelib/fs.scandir": {
      "version": "2.1.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.scandir/-/fs.scandir-2.1.5.tgz",
      "integrity": "sha512-vq24Bq3ym5HEQm2NKCr3yXDwjc7vTsEThRDnkp2DK9p1uqLR+DHurm/NOTo0KG7HYHU7eppKZj3MyqYuMBf62g==",
      "dependencies": {
        "@nodelib/fs.stat": "2.0.5",
        "run-parallel": "^1.1.9"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.stat": {
      "version": "2.0.5",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.stat/-/fs.stat-2.0.5.tgz",
      "integrity": "sha512-RkhPPp2zrqDAQA/2jNhnztcPAlv64XdhIp7a7454A5ovI7Bukxgt7MX7udwAu3zg1DcpPU0rz3VV1SeaqvY4+A==",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@nodelib/fs.walk": {
      "version": "1.2.8",
      "resolved": "https://registry.npmjs.org/@nodelib/fs.walk/-/fs.walk-1.2.8.tgz",
      "integrity": "sha512-oGB+UxlgWcgQkgwo8GcEGwemoTFt3FIO9ababBmaGwXIoBKZ+GTy0pP185beGg7Llih/NSHSV2XAs1lnznocSg==",
      "dependencies": {
        "@nodelib/fs.scandir": "2.1.5",
        "fastq": "^1.6.0"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/@pkgjs/parseargs": {
      "version": "0.11.0",
      "resolved": "https://registry.npmjs.org/@pkgjs/parseargs/-/parseargs-0.11.0.tgz",
      "integrity": "sha512-+1VkjdD0QBLPodGrJUeqarH8VAIvQODIbwh9XpP5Syisf7YoQgsJKPNFoqqLQlu+VQ/tVSshMR6loPMn8U+dPg==",
      "optional": true,
      "engines": {
        "node": ">=14"
      }
    },
    "node_modules/@remix-run/router": {
      "version": "1.23.0",
      "resolved": "https://registry.npmjs.org/@remix-run/router/-/router-1.23.0.tgz",
      "integrity": "sha512-O3rHJzAQKamUz1fvE0Qaw0xSFqsA/yafi2iqeE0pvdFtCO1viYx8QL6f3Ln/aCCTLxs68SLf0KPM9eSeM8yBnA==",
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/@stripe/stripe-js": {
      "version": "2.4.0",
      "resolved": "https://registry.npmjs.org/@stripe/stripe-js/-/stripe-js-2.4.0.tgz",
      "integrity": "sha512-WFkQx1mbs2b5+7looI9IV1BLa3bIApuN3ehp9FP58xGg7KL9hCHDECgW3BwO9l9L+xBPVAD7Yjn1EhGe6EDTeA=="
    },
    "node_modules/@tanstack/react-virtual": {
      "version": "3.13.12",
      "resolved": "https://registry.npmjs.org/@tanstack/react-virtual/-/react-virtual-3.13.12.tgz",
      "integrity": "sha512-Gd13QdxPSukP8ZrkbgS2RwoZseTTbQPLnQEn7HY/rqtM+8Zt95f7xKC7N0EsKs7aoz0WzZ+fditZux+F8EzYxA==",
      "dependencies": {
        "@tanstack/virtual-core": "3.13.12"
      },
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      },
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0",
        "react-dom": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/@tanstack/virtual-core": {
      "version": "3.13.12",
      "resolved": "https://registry.npmjs.org/@tanstack/virtual-core/-/virtual-core-3.13.12.tgz",
      "integrity": "sha512-1YBOJfRHV4sXUmWsFSf5rQor4Ss82G8dQWLRbnk3GA4jeP8hQt1hxXh0tmflpC0dz3VgEv/1+qwPyLeWkQuPFA==",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/tannerlinsley"
      }
    },
    "node_modules/@types/prop-types": {
      "version": "15.7.15",
      "resolved": "https://registry.npmjs.org/@types/prop-types/-/prop-types-15.7.15.tgz",
      "integrity": "sha512-F6bEyamV9jKGAFBEmlQnesRPGOQqS2+Uwi0Em15xenOxHaf2hv6L8YCVn3rPdPJOiJfPiCnLIRyvwVaqMY3MIw==",
      "dev": true
    },
    "node_modules/@types/react": {
      "version": "18.3.24",
      "resolved": "https://registry.npmjs.org/@types/react/-/react-18.3.24.tgz",
      "integrity": "sha512-0dLEBsA1kI3OezMBF8nSsb7Nk19ZnsyE1LLhB8r27KbgU5H4pvuqZLdtE+aUkJVoXgTVuA+iLIwmZ0TuK4tx6A==",
      "dev": true,
      "dependencies": {
        "@types/prop-types": "*",
        "csstype": "^3.0.2"
      }
    },
    "node_modules/@types/react-dom": {
      "version": "18.3.7",
      "resolved": "https://registry.npmjs.org/@types/react-dom/-/react-dom-18.3.7.tgz",
      "integrity": "sha512-MEe3UeoENYVFXzoXEWsvcpg6ZvlrFNlOQ7EOsvhI3CfAXwzPfO8Qwuxd40nepsYKqyyVQnTdEfv68q91yLcKrQ==",
      "dev": true,
      "peerDependencies": {
        "@types/react": "^18.0.0"
      }
    },
    "node_modules/agent-base": {
      "version": "7.1.4",
      "resolved": "https://registry.npmjs.org/agent-base/-/agent-base-7.1.4.tgz",
      "integrity": "sha512-MnA+YT8fwfJPgBx3m60MNqakm30XOkyIoH1y6huTQvC0PwZG7ki8NacLBcrPbNoo8vEZy7Jpuk7+jMO+CUovTQ==",
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/ansi-regex": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-6.2.0.tgz",
      "integrity": "sha512-TKY5pyBkHyADOPYlRT9Lx6F544mPl0vS5Ew7BJ45hA08Q+t3GjbueLliBWN3sMICk6+y7HdyxSzC4bWS8baBdg==",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-regex?sponsor=1"
      }
    },
    "node_modules/ansi-styles": {
      "version": "6.2.1",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-6.2.1.tgz",
      "integrity": "sha512-bN798gFfQX+viw3R7yrGWRqnrN2oRkEkUjjl4JNn4E8GxxbjtG3FbrEIIY3l8/hrwUwIeCZvi4QuOTP4MErVug==",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/any-promise": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/any-promise/-/any-promise-1.3.0.tgz",
      "integrity": "sha512-7UvmKalWRt1wgjL1RrGxoSJW/0QZFIegpeGvZG9kjp8vrRu55XTHbwnqq2GpXm9uLbcuhxm3IqX9OB4MZR1b2A=="
    },
    "node_modules/anymatch": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/anymatch/-/anymatch-3.1.3.tgz",
      "integrity": "sha512-KMReFUr0B4t+D+OBkjR3KYqvocp2XaSzO55UcB6mgQMd3KbcE+mWTyvVV7D/zsdEbNnV6acZUutkiHQXvTr1Rw==",
      "dependencies": {
        "normalize-path": "^3.0.0",
        "picomatch": "^2.0.4"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/arg": {
      "version": "5.0.2",
      "resolved": "https://registry.npmjs.org/arg/-/arg-5.0.2.tgz",
      "integrity": "sha512-PYjyFOLKQ9y57JvQ6QLo8dAgNqswh8M1RMJYdQduT6xbWSgK36P/Z/v+p888pM69jMMfS8Xd8F6I1kQ/I9HUGg=="
    },
    "node_modules/asynckit": {
      "version": "0.4.0",
      "resolved": "https://registry.npmjs.org/asynckit/-/asynckit-0.4.0.tgz",
      "integrity": "sha512-Oei9OH4tRh0YqU3GxhX79dM/mwVgvbZJaSNaRk+bshkj0S5cfHcgYakreBjrHwatXKbz+IoIdYLxrKim2MjW0Q=="
    },
    "node_modules/autoprefixer": {
      "version": "10.4.21",
      "resolved": "https://registry.npmjs.org/autoprefixer/-/autoprefixer-10.4.21.tgz",
      "integrity": "sha512-O+A6LWV5LDHSJD3LjHYoNi4VLsj/Whi7k6zG12xTYaU4cQ8oxQGckXNX8cRHK5yOZ/ppVHe0ZBXGzSV9jXdVbQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/autoprefixer"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "browserslist": "^4.24.4",
        "caniuse-lite": "^1.0.30001702",
        "fraction.js": "^4.3.7",
        "normalize-range": "^0.1.2",
        "picocolors": "^1.1.1",
        "postcss-value-parser": "^4.2.0"
      },
      "bin": {
        "autoprefixer": "bin/autoprefixer"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      },
      "peerDependencies": {
        "postcss": "^8.1.0"
      }
    },
    "node_modules/axios": {
      "version": "1.11.0",
      "resolved": "https://registry.npmjs.org/axios/-/axios-1.11.0.tgz",
      "integrity": "sha512-1Lx3WLFQWm3ooKDYZD1eXmoGO9fxYQjrycfHFC8P0sCfQVXyROp0p9PFWBehewBOdCwHc+f/b8I0fMto5eSfwA==",
      "dependencies": {
        "follow-redirects": "^1.15.6",
        "form-data": "^4.0.4",
        "proxy-from-env": "^1.1.0"
      }
    },
    "node_modules/balanced-match": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/balanced-match/-/balanced-match-1.0.2.tgz",
      "integrity": "sha512-3oSeUO0TMV67hN1AmbXsK4yaqU7tjiHlbxRDZOpH0KW9+CeX4bRAaX0Anxt0tx2MrpRpWwQaPwIlISEJhYU5Pw=="
    },
    "node_modules/bin-links": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/bin-links/-/bin-links-5.0.0.tgz",
      "integrity": "sha512-sdleLVfCjBtgO5cNjA2HVRvWBJAHs4zwenaCPMNJAJU0yNxpzj80IpjOIimkpkr+mhlA+how5poQtt53PygbHA==",
      "dependencies": {
        "cmd-shim": "^7.0.0",
        "npm-normalize-package-bin": "^4.0.0",
        "proc-log": "^5.0.0",
        "read-cmd-shim": "^5.0.0",
        "write-file-atomic": "^6.0.0"
      },
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/binary-extensions": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/binary-extensions/-/binary-extensions-2.3.0.tgz",
      "integrity": "sha512-Ceh+7ox5qe7LJuLHoY0feh3pHuUDHAcRUeyL2VYghZwfpkNIy/+8Ocg0a3UuSoYzavmylwuLWQOf3hl0jjMMIw==",
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/brace-expansion": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/brace-expansion/-/brace-expansion-2.0.2.tgz",
      "integrity": "sha512-Jt0vHyM+jmUBqojB7E1NIYadt0vI0Qxjxd2TErW94wDz+E2LAm5vKMXXwg6ZZBTHPuUlDgQHKXvjGBdfcF1ZDQ==",
      "dependencies": {
        "balanced-match": "^1.0.0"
      }
    },
    "node_modules/braces": {
      "version": "3.0.3",
      "resolved": "https://registry.npmjs.org/braces/-/braces-3.0.3.tgz",
      "integrity": "sha512-yQbXgO/OSZVD2IsiLlro+7Hf6Q18EJrKSEsdoMzKePKXct3gvD8oLcOQdIzGupr5Fj+EDe8gO/lxc1BzfMpxvA==",
      "dependencies": {
        "fill-range": "^7.1.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/browserslist": {
      "version": "4.25.4",
      "resolved": "https://registry.npmjs.org/browserslist/-/browserslist-4.25.4.tgz",
      "integrity": "sha512-4jYpcjabC606xJ3kw2QwGEZKX0Aw7sgQdZCvIK9dhVSPh76BKo+C+btT1RRofH7B+8iNpEbgGNVWiLki5q93yg==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "caniuse-lite": "^1.0.30001737",
        "electron-to-chromium": "^1.5.211",
        "node-releases": "^2.0.19",
        "update-browserslist-db": "^1.1.3"
      },
      "bin": {
        "browserslist": "cli.js"
      },
      "engines": {
        "node": "^6 || ^7 || ^8 || ^9 || ^10 || ^11 || ^12 || >=13.7"
      }
    },
    "node_modules/call-bind-apply-helpers": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/call-bind-apply-helpers/-/call-bind-apply-helpers-1.0.2.tgz",
      "integrity": "sha512-Sp1ablJ0ivDkSzjcaJdxEunN5/XvksFJ2sMBFfq6x0ryhQV/2b/KwFe21cMpmHtPOSij8K99/wSfoEuTObmuMQ==",
      "dependencies": {
        "es-errors": "^1.3.0",
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/camelcase-css": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/camelcase-css/-/camelcase-css-2.0.1.tgz",
      "integrity": "sha512-QOSvevhslijgYwRx6Rv7zKdMF8lbRmx+uQGx2+vDc+KI/eBnsy9kit5aj23AgGu3pa4t9AgwbnXWqS+iOY+2aA==",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/caniuse-lite": {
      "version": "1.0.30001739",
      "resolved": "https://registry.npmjs.org/caniuse-lite/-/caniuse-lite-1.0.30001739.tgz",
      "integrity": "sha512-y+j60d6ulelrNSwpPyrHdl+9mJnQzHBr08xm48Qno0nSk4h3Qojh+ziv2qE6rXf4k3tadF4o1J/1tAbVm1NtnA==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/caniuse-lite"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ]
    },
    "node_modules/chokidar": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/chokidar/-/chokidar-3.6.0.tgz",
      "integrity": "sha512-7VT13fmjotKpGipCW9JEQAusEPE+Ei8nl6/g4FBAmIm0GOOLMua9NDDo/DWp0ZAxCr3cPq5ZpBqmPAQgDda2Pw==",
      "dependencies": {
        "anymatch": "~3.1.2",
        "braces": "~3.0.2",
        "glob-parent": "~5.1.2",
        "is-binary-path": "~2.1.0",
        "is-glob": "~4.0.1",
        "normalize-path": "~3.0.0",
        "readdirp": "~3.6.0"
      },
      "engines": {
        "node": ">= 8.10.0"
      },
      "funding": {
        "url": "https://paulmillr.com/funding/"
      },
      "optionalDependencies": {
        "fsevents": "~2.3.2"
      }
    },
    "node_modules/chokidar/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/chownr": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/chownr/-/chownr-3.0.0.tgz",
      "integrity": "sha512-+IxzY9BZOQd/XuYPRmrvEVjF/nqj5kgT4kEq7VofrDoM1MxoRjEWkrCC3EtLi59TVawxTAn+orJwFQcrqEN1+g==",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/class-variance-authority": {
      "version": "0.7.1",
      "resolved": "https://registry.npmjs.org/class-variance-authority/-/class-variance-authority-0.7.1.tgz",
      "integrity": "sha512-Ka+9Trutv7G8M6WT6SeiRWz792K5qEqIGEGzXKhAE6xOWAY6pPH8U+9IY3oCMv6kqTmLsv7Xh/2w2RigkePMsg==",
      "dependencies": {
        "clsx": "^2.1.1"
      },
      "funding": {
        "url": "https://polar.sh/cva"
      }
    },
    "node_modules/client-only": {
      "version": "0.0.1",
      "resolved": "https://registry.npmjs.org/client-only/-/client-only-0.0.1.tgz",
      "integrity": "sha512-IV3Ou0jSMzZrd3pZ48nLkT9DA7Ag1pnPzaiQhpW7c3RbcqqzvzzVu+L8gfqMp/8IM2MQtSiqaCxrrcfu8I8rMA=="
    },
    "node_modules/clsx": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/clsx/-/clsx-2.1.1.tgz",
      "integrity": "sha512-eYm0QWBtUrBWZWG0d386OGAw16Z995PiOVo2B7bjWSbHedGl5e0ZWaq65kOGgUSNesEIDkB9ISbTg/JK9dhCZA==",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/cmd-shim": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/cmd-shim/-/cmd-shim-7.0.0.tgz",
      "integrity": "sha512-rtpaCbr164TPPh+zFdkWpCyZuKkjpAzODfaZCf/SVJZzJN+4bHQb/LP3Jzq5/+84um3XXY8r548XiWKSborwVw==",
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/color-convert": {
      "version": "2.0.1",
      "resolved": "https://registry.npmjs.org/color-convert/-/color-convert-2.0.1.tgz",
      "integrity": "sha512-RRECPsj7iu/xb5oKYcsFHSppFNnsj/52OVTRKb4zP5onXwVF3zVmmToNcOfGC+CRDpfK/U584fMg38ZHCaElKQ==",
      "dependencies": {
        "color-name": "~1.1.4"
      },
      "engines": {
        "node": ">=7.0.0"
      }
    },
    "node_modules/color-name": {
      "version": "1.1.4",
      "resolved": "https://registry.npmjs.org/color-name/-/color-name-1.1.4.tgz",
      "integrity": "sha512-dOy+3AuW3a2wNbZHIuMZpTcgjGuLU/uBL/ubcZF9OXbDo8ff4O8yVp5Bf0efS8uEoYo5q4Fx7dY9OgQGXgAsQA=="
    },
    "node_modules/combined-stream": {
      "version": "1.0.8",
      "resolved": "https://registry.npmjs.org/combined-stream/-/combined-stream-1.0.8.tgz",
      "integrity": "sha512-FQN4MRfuJeHf7cBbBMJFXhKSDq+2kAArBlmRBvcvFE5BB1HZKXtSFASDhdlz9zOYwxh8lDdnvmMOe/+5cdoEdg==",
      "dependencies": {
        "delayed-stream": "~1.0.0"
      },
      "engines": {
        "node": ">= 0.8"
      }
    },
    "node_modules/commander": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/commander/-/commander-4.1.1.tgz",
      "integrity": "sha512-NOKm8xhkzAjzFx8B2v5OAHT+u5pRQc2UCa2Vq9jYL/31o2wi9mxBA7LIFs3sV5VSC49z6pEhfbMULvShKj26WA==",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/cross-spawn": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/cross-spawn/-/cross-spawn-7.0.6.tgz",
      "integrity": "sha512-uV2QOWP2nWzsy2aMp8aRibhi9dlzF5Hgh5SHaB9OiTGEyDTiJJyx0uy51QXdyWbtAHNua4XJzUKca3OzKUd3vA==",
      "dependencies": {
        "path-key": "^3.1.0",
        "shebang-command": "^2.0.0",
        "which": "^2.0.1"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/cssesc": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/cssesc/-/cssesc-3.0.0.tgz",
      "integrity": "sha512-/Tb/JcjK111nNScGob5MNtsntNM1aCNUDipB/TkwZFhyDrrE47SOx/18wF2bbjgc3ZzCSKW1T5nt5EbFoAz/Vg==",
      "bin": {
        "cssesc": "bin/cssesc"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/csstype": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.1.1.tgz",
      "integrity": "sha512-DJR/VvkAvSZW9bTouZue2sSxDwdTN92uHjqeKVm+0dAqdfNykRzQ95tay8aXMBAAPpUiq4Qcug2L7neoRh2Egw=="
    },
    "node_modules/data-uri-to-buffer": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/data-uri-to-buffer/-/data-uri-to-buffer-4.0.1.tgz",
      "integrity": "sha512-0R9ikRb668HB7QDxT1vkpuUBtqc53YyAwMwGeUFKRojY/NWKvdZ+9UYtRfGmhqNbRkTSVpMbmyhXipFFv2cb/A==",
      "engines": {
        "node": ">= 12"
      }
    },
    "node_modules/debug": {
      "version": "4.4.1",
      "resolved": "https://registry.npmjs.org/debug/-/debug-4.4.1.tgz",
      "integrity": "sha512-KcKCqiftBJcZr++7ykoDIEwSa3XWowTfNPo92BYxjXiyYEVrUQh2aLyhxBCwww+heortUFxEJYcRzosstTEBYQ==",
      "dependencies": {
        "ms": "^2.1.3"
      },
      "engines": {
        "node": ">=6.0"
      },
      "peerDependenciesMeta": {
        "supports-color": {
          "optional": true
        }
      }
    },
    "node_modules/delayed-stream": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/delayed-stream/-/delayed-stream-1.0.0.tgz",
      "integrity": "sha512-ZySD7Nf91aLB0RxL4KGrKHBXl7Eds1DAmEdcoVawXnLD7SDhpNgtuII2aAkg7a7QS41jxPSZ17p4VdGnMHk3MQ==",
      "engines": {
        "node": ">=0.4.0"
      }
    },
    "node_modules/didyoumean": {
      "version": "1.2.2",
      "resolved": "https://registry.npmjs.org/didyoumean/-/didyoumean-1.2.2.tgz",
      "integrity": "sha512-gxtyfqMg7GKyhQmb056K7M3xszy/myH8w+B4RT+QXBQsvAOdc3XymqDDPHx1BgPgsdAA5SIifona89YtRATDzw=="
    },
    "node_modules/dlv": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/dlv/-/dlv-1.1.3.tgz",
      "integrity": "sha512-+HlytyjlPKnIG8XuRG8WvmBP8xs8P71y+SKKS6ZXWoEgLuePxtDoUEiH7WkdePWrQ5JBpE6aoVqfZfJUQkjXwA=="
    },
    "node_modules/dunder-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/dunder-proto/-/dunder-proto-1.0.1.tgz",
      "integrity": "sha512-KIN/nDJBQRcXw0MLVhZE9iQHmG68qAVIBg9CqmUYjmQIhgij9U5MFvrqkUL5FbtyyzZuOeOt0zdeRe4UY7ct+A==",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.1",
        "es-errors": "^1.3.0",
        "gopd": "^1.2.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/eastasianwidth": {
      "version": "0.2.0",
      "resolved": "https://registry.npmjs.org/eastasianwidth/-/eastasianwidth-0.2.0.tgz",
      "integrity": "sha512-I88TYZWc9XiYHRQ4/3c5rjjfgkjhLyW2luGIheGERbNQ6OY7yTybanSpDXZa8y7VUP9YmDcYa+eyq4ca7iLqWA=="
    },
    "node_modules/electron-to-chromium": {
      "version": "1.5.214",
      "resolved": "https://registry.npmjs.org/electron-to-chromium/-/electron-to-chromium-1.5.214.tgz",
      "integrity": "sha512-TpvUNdha+X3ybfU78NoQatKvQEm1oq3lf2QbnmCEdw+Bd9RuIAY+hJTvq1avzHM0f7EJfnH3vbCnbzKzisc/9Q=="
    },
    "node_modules/emoji-regex": {
      "version": "9.2.2",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-9.2.2.tgz",
      "integrity": "sha512-L18DaJsXSUk2+42pv8mLs5jJT2hqFkFE4j21wOmgbUqsZ2hL72NsUU785g9RXgo3s0ZNgVl42TiHp3ZtOv/Vyg=="
    },
    "node_modules/es-define-property": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/es-define-property/-/es-define-property-1.0.1.tgz",
      "integrity": "sha512-e3nRfgfUZ4rNGL232gUgX06QNyyez04KdjFrF+LTRoOXmrOgFKDg4BCdsjW8EnT69eqdYGmRpJwiPVYNrCaW3g==",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-errors": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/es-errors/-/es-errors-1.3.0.tgz",
      "integrity": "sha512-Zf5H2Kxt2xjTvbJvP2ZWLEICxA6j+hAmMzIlypy4xcBg1vKVnx89Wy0GbS+kf5cwCVFFzdCFh2XSCFNULS6csw==",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-object-atoms": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/es-object-atoms/-/es-object-atoms-1.1.1.tgz",
      "integrity": "sha512-FGgH2h8zKNim9ljj7dankFPcICIK9Cp5bm+c2gQSYePhpaG5+esrLODihIorn+Pe6FGJzWhXQotPv73jTaldXA==",
      "dependencies": {
        "es-errors": "^1.3.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/es-set-tostringtag": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/es-set-tostringtag/-/es-set-tostringtag-2.1.0.tgz",
      "integrity": "sha512-j6vWzfrGVfyXxge+O0x5sh6cvxAog0a/4Rdd2K36zCMV5eJ+/+tOAngRO8cODMNWbVRdVlmGZQL2YS3yR8bIUA==",
      "dependencies": {
        "es-errors": "^1.3.0",
        "get-intrinsic": "^1.2.6",
        "has-tostringtag": "^1.0.2",
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/escalade": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/escalade/-/escalade-3.2.0.tgz",
      "integrity": "sha512-WUj2qlxaQtO4g6Pq5c29GTcWGDyd8itL8zTlipgECz3JesAiiOKotd8JU6otB3PACgG6xkJUyVhboMS+bje/jA==",
      "engines": {
        "node": ">=6"
      }
    },
    "node_modules/fast-glob": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/fast-glob/-/fast-glob-3.3.3.tgz",
      "integrity": "sha512-7MptL8U0cqcFdzIzwOTHoilX9x5BrNqye7Z/LuC7kCMRio1EMSyqRK3BEAUD7sXRq4iT4AzTVuZdhgQ2TCvYLg==",
      "dependencies": {
        "@nodelib/fs.stat": "^2.0.2",
        "@nodelib/fs.walk": "^1.2.3",
        "glob-parent": "^5.1.2",
        "merge2": "^1.3.0",
        "micromatch": "^4.0.8"
      },
      "engines": {
        "node": ">=8.6.0"
      }
    },
    "node_modules/fast-glob/node_modules/glob-parent": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-5.1.2.tgz",
      "integrity": "sha512-AOIgSQCepiJYwP3ARnGx+5VnTu2HBYdzbGP45eLw1vr3zB3vZLeyed1sC9hnbcOc9/SrMyM5RPQrkGz4aS9Zow==",
      "dependencies": {
        "is-glob": "^4.0.1"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/fastq": {
      "version": "1.19.1",
      "resolved": "https://registry.npmjs.org/fastq/-/fastq-1.19.1.tgz",
      "integrity": "sha512-GwLTyxkCXjXbxqIhTsMI2Nui8huMPtnxg7krajPJAjnEG/iiOS7i+zCtWGZR9G0NBKbXKh6X9m9UIsYX/N6vvQ==",
      "dependencies": {
        "reusify": "^1.0.4"
      }
    },
    "node_modules/fetch-blob": {
      "version": "3.2.0",
      "resolved": "https://registry.npmjs.org/fetch-blob/-/fetch-blob-3.2.0.tgz",
      "integrity": "sha512-7yAQpD2UMJzLi1Dqv7qFYnPbaPx7ZfFK6PiIxQ4PfkGPyNyl2Ugx+a/umUonmKqjhM4DnfbMvdX6otXq83soQQ==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/jimmywarting"
        },
        {
          "type": "paypal",
          "url": "https://paypal.me/jimmywarting"
        }
      ],
      "dependencies": {
        "node-domexception": "^1.0.0",
        "web-streams-polyfill": "^3.0.3"
      },
      "engines": {
        "node": "^12.20 || >= 14.13"
      }
    },
    "node_modules/fill-range": {
      "version": "7.1.1",
      "resolved": "https://registry.npmjs.org/fill-range/-/fill-range-7.1.1.tgz",
      "integrity": "sha512-YsGpe3WHLK8ZYi4tWDg2Jy3ebRz2rXowDxnld4bkQB00cc/1Zw9AWnC0i9ztDJitivtQvaI9KaLyKrc+hBW0yg==",
      "dependencies": {
        "to-regex-range": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/follow-redirects": {
      "version": "1.15.11",
      "resolved": "https://registry.npmjs.org/follow-redirects/-/follow-redirects-1.15.11.tgz",
      "integrity": "sha512-deG2P0JfjrTxl50XGCDyfI97ZGVCxIpfKYmfyrQ54n5FO/0gfIES8C/Psl6kWVDolizcaaxZJnTS0QSMxvnsBQ==",
      "funding": [
        {
          "type": "individual",
          "url": "https://github.com/sponsors/RubenVerborgh"
        }
      ],
      "engines": {
        "node": ">=4.0"
      },
      "peerDependenciesMeta": {
        "debug": {
          "optional": true
        }
      }
    },
    "node_modules/foreground-child": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/foreground-child/-/foreground-child-3.3.1.tgz",
      "integrity": "sha512-gIXjKqtFuWEgzFRJA9WCQeSJLZDjgJUOMCMzxtvFq/37KojM1BFGufqsCy0r4qSQmYLsZYMeyRqzIWOMup03sw==",
      "dependencies": {
        "cross-spawn": "^7.0.6",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/form-data": {
      "version": "4.0.4",
      "resolved": "https://registry.npmjs.org/form-data/-/form-data-4.0.4.tgz",
      "integrity": "sha512-KrGhL9Q4zjj0kiUt5OO4Mr/A/jlI2jDYs5eHBpYHPcBEVSiipAvn2Ko2HnPe20rmcuuvMHNdZFp+4IlGTMF0Ow==",
      "dependencies": {
        "asynckit": "^0.4.0",
        "combined-stream": "^1.0.8",
        "es-set-tostringtag": "^2.1.0",
        "hasown": "^2.0.2",
        "mime-types": "^2.1.12"
      },
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/formdata-polyfill": {
      "version": "4.0.10",
      "resolved": "https://registry.npmjs.org/formdata-polyfill/-/formdata-polyfill-4.0.10.tgz",
      "integrity": "sha512-buewHzMvYL29jdeQTVILecSaZKnt/RJWjoZCF5OW60Z67/GmSLBkOFM7qh1PI3zFNtJbaZL5eQu1vLfazOwj4g==",
      "dependencies": {
        "fetch-blob": "^3.1.2"
      },
      "engines": {
        "node": ">=12.20.0"
      }
    },
    "node_modules/fraction.js": {
      "version": "4.3.7",
      "resolved": "https://registry.npmjs.org/fraction.js/-/fraction.js-4.3.7.tgz",
      "integrity": "sha512-ZsDfxO51wGAXREY55a7la9LScWpwv9RxIrYABrlvOFBlH/ShPnrtsXeuUIfXKKOVicNxQ+o8JTbJvjS4M89yew==",
      "engines": {
        "node": "*"
      },
      "funding": {
        "type": "patreon",
        "url": "https://github.com/sponsors/rawify"
      }
    },
    "node_modules/framer-motion": {
      "version": "10.18.0",
      "resolved": "https://registry.npmjs.org/framer-motion/-/framer-motion-10.18.0.tgz",
      "integrity": "sha512-oGlDh1Q1XqYPksuTD/usb0I70hq95OUzmL9+6Zd+Hs4XV0oaISBa/UUMSjYiq6m8EUF32132mOJ8xVZS+I0S6w==",
      "dependencies": {
        "tslib": "^2.4.0"
      },
      "optionalDependencies": {
        "@emotion/is-prop-valid": "^0.8.2"
      },
      "peerDependencies": {
        "react": "^18.0.0",
        "react-dom": "^18.0.0"
      },
      "peerDependenciesMeta": {
        "react": {
          "optional": true
        },
        "react-dom": {
          "optional": true
        }
      }
    },
    "node_modules/fsevents": {
      "version": "2.3.3",
      "resolved": "https://registry.npmjs.org/fsevents/-/fsevents-2.3.3.tgz",
      "integrity": "sha512-5xoDfX+fL7faATnagmWPpbFtwh/R77WmMMqqHGS65C3vvB0YHrgF+B1YmZ3441tMj5n63k0212XNoJwzlhffQw==",
      "hasInstallScript": true,
      "optional": true,
      "os": [
        "darwin"
      ],
      "engines": {
        "node": "^8.16.0 || ^10.6.0 || >=11.0.0"
      }
    },
    "node_modules/function-bind": {
      "version": "1.1.2",
      "resolved": "https://registry.npmjs.org/function-bind/-/function-bind-1.1.2.tgz",
      "integrity": "sha512-7XHNxH7qX9xG5mIwxkhumTox/MIRNcOgDrxWsMt2pAr23WHp6MrRlN7FBSFpCpr+oVO0F744iUgR82nJMfG2SA==",
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-intrinsic": {
      "version": "1.3.0",
      "resolved": "https://registry.npmjs.org/get-intrinsic/-/get-intrinsic-1.3.0.tgz",
      "integrity": "sha512-9fSjSaos/fRIVIp+xSJlE6lfwhES7LNtKaCBIamHsjr2na1BiABJPo0mOjjz8GJDURarmCPGqaiVg5mfjb98CQ==",
      "dependencies": {
        "call-bind-apply-helpers": "^1.0.2",
        "es-define-property": "^1.0.1",
        "es-errors": "^1.3.0",
        "es-object-atoms": "^1.1.1",
        "function-bind": "^1.1.2",
        "get-proto": "^1.0.1",
        "gopd": "^1.2.0",
        "has-symbols": "^1.1.0",
        "hasown": "^2.0.2",
        "math-intrinsics": "^1.1.0"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/get-proto": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/get-proto/-/get-proto-1.0.1.tgz",
      "integrity": "sha512-sTSfBjoXBp89JvIKIefqw7U2CCebsc74kiY6awiGogKtoSGbgjYE/G/+l9sF3MWFPNc9IcoOC4ODfKHfxFmp0g==",
      "dependencies": {
        "dunder-proto": "^1.0.1",
        "es-object-atoms": "^1.0.0"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/glob": {
      "version": "10.4.5",
      "resolved": "https://registry.npmjs.org/glob/-/glob-10.4.5.tgz",
      "integrity": "sha512-7Bv8RF0k6xjo7d4A/PxYLbUCfb6c+Vpd2/mB2yRDlew7Jb5hEXiCD9ibfO7wpk8i4sevK6DFny9h7EYbM3/sHg==",
      "dependencies": {
        "foreground-child": "^3.1.0",
        "jackspeak": "^3.1.2",
        "minimatch": "^9.0.4",
        "minipass": "^7.1.2",
        "package-json-from-dist": "^1.0.0",
        "path-scurry": "^1.11.1"
      },
      "bin": {
        "glob": "dist/esm/bin.mjs"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/glob-parent": {
      "version": "6.0.2",
      "resolved": "https://registry.npmjs.org/glob-parent/-/glob-parent-6.0.2.tgz",
      "integrity": "sha512-XxwI8EOhVQgWp6iDL+3b0r86f4d6AX6zSU55HfB4ydCEuXLXc5FcYeOu+nnGftS4TEju/11rt4KJPTMgbfmv4A==",
      "dependencies": {
        "is-glob": "^4.0.3"
      },
      "engines": {
        "node": ">=10.13.0"
      }
    },
    "node_modules/glob-to-regexp": {
      "version": "0.4.1",
      "resolved": "https://registry.npmjs.org/glob-to-regexp/-/glob-to-regexp-0.4.1.tgz",
      "integrity": "sha512-lkX1HJXwyMcprw/5YUZc2s7DrpAiHB21/V+E1rHUrVNokkvB6bqMzT0VfV6/86ZNabt1k14YOIaT7nDvOX3Iiw=="
    },
    "node_modules/goober": {
      "version": "2.1.16",
      "resolved": "https://registry.npmjs.org/goober/-/goober-2.1.16.tgz",
      "integrity": "sha512-erjk19y1U33+XAMe1VTvIONHYoSqE4iS7BYUZfHaqeohLmnC0FdxEh7rQU+6MZ4OajItzjZFSRtVANrQwNq6/g==",
      "peerDependencies": {
        "csstype": "^3.0.10"
      }
    },
    "node_modules/gopd": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/gopd/-/gopd-1.2.0.tgz",
      "integrity": "sha512-ZUKRh6/kUFoAiTAtTYPZJ3hw9wNxx+BIBOijnlG9PnrJsCcSjs1wyyD6vJpaYtgnzDrKYRSqf3OO6Rfa93xsRg==",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-symbols": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/has-symbols/-/has-symbols-1.1.0.tgz",
      "integrity": "sha512-1cDNdwJ2Jaohmb3sg4OmKaMBwuC48sYni5HUw2DvsC8LjGTLK9h+eb1X6RyuOHe4hT0ULCW68iomhjUoKUqlPQ==",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/has-tostringtag": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/has-tostringtag/-/has-tostringtag-1.0.2.tgz",
      "integrity": "sha512-NqADB8VjPFLM2V0VvHUewwwsw0ZWBaIdgo+ieHtK3hasLz4qeCRjYcqfB6AQrBggRKppKF8L52/VqdVsO47Dlw==",
      "dependencies": {
        "has-symbols": "^1.0.3"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/hasown": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/hasown/-/hasown-2.0.2.tgz",
      "integrity": "sha512-0hJU9SCPvmMzIBdZFqNPXWa6dqh7WdH0cII9y+CyS8rG3nL48Bclra9HmKhVVUHyPWNH5Y7xDwAB7bfgSjkUMQ==",
      "dependencies": {
        "function-bind": "^1.1.2"
      },
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/https-proxy-agent": {
      "version": "7.0.6",
      "resolved": "https://registry.npmjs.org/https-proxy-agent/-/https-proxy-agent-7.0.6.tgz",
      "integrity": "sha512-vK9P5/iUfdl95AI+JVyUuIcVtd4ofvtrOr3HNtM2yxC9bnMbEdp3x01OhQNnjb8IJYi38VlTE3mBXwcfvywuSw==",
      "dependencies": {
        "agent-base": "^7.1.2",
        "debug": "4"
      },
      "engines": {
        "node": ">= 14"
      }
    },
    "node_modules/imurmurhash": {
      "version": "0.1.4",
      "resolved": "https://registry.npmjs.org/imurmurhash/-/imurmurhash-0.1.4.tgz",
      "integrity": "sha512-JmXMZ6wuvDmLiHEml9ykzqO6lwFbof0GG4IkcGaENdCRDDmMVnny7s5HsIgHCbaq0w2MyPhDqkhTUgS2LU2PHA==",
      "engines": {
        "node": ">=0.8.19"
      }
    },
    "node_modules/is-binary-path": {
      "version": "2.1.0",
      "resolved": "https://registry.npmjs.org/is-binary-path/-/is-binary-path-2.1.0.tgz",
      "integrity": "sha512-ZMERYes6pDydyuGidse7OsHxtbI7WVeUEozgR/g7rd0xUimYNlvZRE/K2MgZTjWy725IfelLeVcEM97mmtRGXw==",
      "dependencies": {
        "binary-extensions": "^2.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-core-module": {
      "version": "2.16.1",
      "resolved": "https://registry.npmjs.org/is-core-module/-/is-core-module-2.16.1.tgz",
      "integrity": "sha512-UfoeMA6fIJ8wTYFEUjelnaGI67v6+N7qXJEvQuIGa99l4xsCruSYOVSQ0uPANn4dAzm8lkYPaKLrrijLq7x23w==",
      "dependencies": {
        "hasown": "^2.0.2"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/is-extglob": {
      "version": "2.1.1",
      "resolved": "https://registry.npmjs.org/is-extglob/-/is-extglob-2.1.1.tgz",
      "integrity": "sha512-SbKbANkN603Vi4jEZv49LeVJMn4yGwsbzZworEoyEiutsN3nJYdbO36zfhGJ6QEDpOZIFkDtnq5JRxmvl3jsoQ==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-fullwidth-code-point": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/is-fullwidth-code-point/-/is-fullwidth-code-point-3.0.0.tgz",
      "integrity": "sha512-zymm5+u+sCsSWyD9qNaejV3DFvhCKclKdizYaJUuHA83RLjb7nSuGnddCHGv0hk+KY7BMAlsWeK4Ueg6EV6XQg==",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/is-glob": {
      "version": "4.0.3",
      "resolved": "https://registry.npmjs.org/is-glob/-/is-glob-4.0.3.tgz",
      "integrity": "sha512-xelSayHH36ZgE7ZWhli7pW34hNbNl8Ojv5KVmkJD4hBdD3th8Tfk9vYasLM+mXWOZhFkgZfxhLSnrwRr4elSSg==",
      "dependencies": {
        "is-extglob": "^2.1.1"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/is-number": {
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/is-number/-/is-number-7.0.0.tgz",
      "integrity": "sha512-41Cifkg6e8TylSpdtTpeLVMqvSBEVzTttHvERD741+pnZ8ANv0004MRL43QKPDlK9cGvNp6NZWZUBlbGXYxxng==",
      "engines": {
        "node": ">=0.12.0"
      }
    },
    "node_modules/isexe": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/isexe/-/isexe-2.0.0.tgz",
      "integrity": "sha512-RHxMLp9lnKHGHRng9QFhRCMbYAcVpn69smSGcq3f36xjgVVWThj4qqLbTLlq7Ssj8B+fIQ1EuCEGI2lKsyQeIw=="
    },
    "node_modules/jackspeak": {
      "version": "3.4.3",
      "resolved": "https://registry.npmjs.org/jackspeak/-/jackspeak-3.4.3.tgz",
      "integrity": "sha512-OGlZQpz2yfahA/Rd1Y8Cd9SIEsqvXkLVoSw/cgwhnhFMDbsQFeZYoJJ7bIZBS9BcamUW96asq/npPWugM+RQBw==",
      "dependencies": {
        "@isaacs/cliui": "^8.0.2"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      },
      "optionalDependencies": {
        "@pkgjs/parseargs": "^0.11.0"
      }
    },
    "node_modules/jiti": {
      "version": "1.21.7",
      "resolved": "https://registry.npmjs.org/jiti/-/jiti-1.21.7.tgz",
      "integrity": "sha512-/imKNG4EbWNrVjoNC/1H5/9GFy+tqjGBHCaSsN+P2RnPqjsLmv6UD3Ej+Kj8nBWaRAwyk7kK5ZUc+OEatnTR3A==",
      "bin": {
        "jiti": "bin/jiti.js"
      }
    },
    "node_modules/js-cookie": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/js-cookie/-/js-cookie-3.0.1.tgz",
      "integrity": "sha512-+0rgsUXZu4ncpPxRL+lNEptWMOWl9etvPHc/koSRp6MPwpRYAhmk0dUG00J4bxVV3r9uUzfo24wW0knS07SKSw==",
      "engines": {
        "node": ">=12"
      }
    },
    "node_modules/js-tokens": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/js-tokens/-/js-tokens-4.0.0.tgz",
      "integrity": "sha512-RdJUflcE3cUzKiMqQgsCu06FPu9UdIJO0beYbPhHN4k6apgJtifcoCtT9bcxOpYBtpD2kCM6Sbzg4CausW/PKQ=="
    },
    "node_modules/lilconfig": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/lilconfig/-/lilconfig-3.1.3.tgz",
      "integrity": "sha512-/vlFKAoH5Cgt3Ie+JLhRbwOsCQePABiU3tJ1egGvyQ+33R/vcwM2Zl2QR/LzjsBeItPt3oSVXapn+m4nQDvpzw==",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/antonk52"
      }
    },
    "node_modules/lines-and-columns": {
      "version": "1.2.4",
      "resolved": "https://registry.npmjs.org/lines-and-columns/-/lines-and-columns-1.2.4.tgz",
      "integrity": "sha512-7ylylesZQ/PV29jhEDl3Ufjo6ZX7gCqJr5F7PKrqc93v7fzSymt1BpwEU8nAUXs8qzzvqhbjhK5QZg6Mt/HkBg=="
    },
    "node_modules/loose-envify": {
      "version": "1.4.0",
      "resolved": "https://registry.npmjs.org/loose-envify/-/loose-envify-1.4.0.tgz",
      "integrity": "sha512-lyuxPGr/Wfhrlem2CL/UcnUc1zcqKAImBDzukY7Y5F/yQiNdko6+fRLevlw1HgMySw7f611UIY408EtxRSoK3Q==",
      "dependencies": {
        "js-tokens": "^3.0.0 || ^4.0.0"
      },
      "bin": {
        "loose-envify": "cli.js"
      }
    },
    "node_modules/lru-cache": {
      "version": "10.4.3",
      "resolved": "https://registry.npmjs.org/lru-cache/-/lru-cache-10.4.3.tgz",
      "integrity": "sha512-JNAzZcXrCt42VGLuYz0zfAzDfAvJWW6AfYlDBQyDV5DClI2m5sAmK+OIO7s59XfsRsWHp02jAJrRadPRGTt6SQ=="
    },
    "node_modules/lucide-react": {
      "version": "0.263.1",
      "resolved": "https://registry.npmjs.org/lucide-react/-/lucide-react-0.263.1.tgz",
      "integrity": "sha512-keqxAx97PlaEN89PXZ6ki1N8nRjGWtDa4021GFYLNj0RgruM5odbpl8GHTExj0hhPq3sF6Up0gnxt6TSHu+ovw==",
      "peerDependencies": {
        "react": "^16.5.1 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/math-intrinsics": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/math-intrinsics/-/math-intrinsics-1.1.0.tgz",
      "integrity": "sha512-/IXtbwEk5HTPyEwyKX6hGkYXxM9nbj64B+ilVJnC/R6B0pH5G4V3b0pVbL7DBj4tkhBAppbQUlf6F6Xl9LHu1g==",
      "engines": {
        "node": ">= 0.4"
      }
    },
    "node_modules/merge2": {
      "version": "1.4.1",
      "resolved": "https://registry.npmjs.org/merge2/-/merge2-1.4.1.tgz",
      "integrity": "sha512-8q7VEgMJW4J8tcfVPy8g09NcQwZdbwFEqhe/WZkoIzjn/3TGDwtOCYtXGxA3O8tPzpczCCDgv+P2P5y00ZJOOg==",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/micromatch": {
      "version": "4.0.8",
      "resolved": "https://registry.npmjs.org/micromatch/-/micromatch-4.0.8.tgz",
      "integrity": "sha512-PXwfBhYu0hBCPw8Dn0E+WDYb7af3dSLVWKi3HGv84IdF4TyFoC0ysxFd0Goxw7nSv4T/PzEJQxsYsEiFCKo2BA==",
      "dependencies": {
        "braces": "^3.0.3",
        "picomatch": "^2.3.1"
      },
      "engines": {
        "node": ">=8.6"
      }
    },
    "node_modules/mime-db": {
      "version": "1.52.0",
      "resolved": "https://registry.npmjs.org/mime-db/-/mime-db-1.52.0.tgz",
      "integrity": "sha512-sPU4uV7dYlvtWJxwwxHD0PuihVNiE7TyAbQ5SWxDCB9mUYvOgroQOwYQQOKPJ8CIbE+1ETVlOoK1UC2nU3gYvg==",
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/mime-types": {
      "version": "2.1.35",
      "resolved": "https://registry.npmjs.org/mime-types/-/mime-types-2.1.35.tgz",
      "integrity": "sha512-ZDY+bPm5zTTF+YpCrAU9nK0UgICYPT0QtT1NZWFv4s++TNkcgVaT0g6+4R2uI4MjQjzysHB1zxuWL50hzaeXiw==",
      "dependencies": {
        "mime-db": "1.52.0"
      },
      "engines": {
        "node": ">= 0.6"
      }
    },
    "node_modules/minimatch": {
      "version": "9.0.5",
      "resolved": "https://registry.npmjs.org/minimatch/-/minimatch-9.0.5.tgz",
      "integrity": "sha512-G6T0ZX48xgozx7587koeX9Ys2NYy6Gmv//P89sEte9V9whIapMNF4idKxnW2QtCcLiTWlb/wfCabAtAFWhhBow==",
      "dependencies": {
        "brace-expansion": "^2.0.1"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/minipass": {
      "version": "7.1.2",
      "resolved": "https://registry.npmjs.org/minipass/-/minipass-7.1.2.tgz",
      "integrity": "sha512-qOOzS1cBTWYF4BH8fVePDBOO9iptMnGUEZwNc/cMWnTV2nVLZ7VoNWEPHkYczZA0pdoA7dl6e7FL659nX9S2aw==",
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/minizlib": {
      "version": "3.0.2",
      "resolved": "https://registry.npmjs.org/minizlib/-/minizlib-3.0.2.tgz",
      "integrity": "sha512-oG62iEk+CYt5Xj2YqI5Xi9xWUeZhDI8jjQmC5oThVH5JGCTgIjr7ciJDzC7MBzYd//WvR1OTmP5Q38Q8ShQtVA==",
      "dependencies": {
        "minipass": "^7.1.2"
      },
      "engines": {
        "node": ">= 18"
      }
    },
    "node_modules/mkdirp": {
      "version": "3.0.1",
      "resolved": "https://registry.npmjs.org/mkdirp/-/mkdirp-3.0.1.tgz",
      "integrity": "sha512-+NsyUUAZDmo6YVHzL/stxSu3t9YS1iljliy3BSDrXJ/dkn1KYdmtZODGGjLcc9XLgVVpH4KshHB8XmZgMhaBXg==",
      "bin": {
        "mkdirp": "dist/cjs/src/bin.js"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/ms": {
      "version": "2.1.3",
      "resolved": "https://registry.npmjs.org/ms/-/ms-2.1.3.tgz",
      "integrity": "sha512-6FlzubTLZG3J2a/NVCAleEhjzq5oxgHyaCU9yYXvcLsvoVaHJq/s5xXI6/XXP6tz7R9xAOtHnSO/tXtF3WRTlA=="
    },
    "node_modules/mz": {
      "version": "2.7.0",
      "resolved": "https://registry.npmjs.org/mz/-/mz-2.7.0.tgz",
      "integrity": "sha512-z81GNO7nnYMEhrGh9LeymoE4+Yr0Wn5McHIZMK5cfQCl+NDX08sCZgUc9/6MHni9IWuFLm1Z3HTCXu2z9fN62Q==",
      "dependencies": {
        "any-promise": "^1.0.0",
        "object-assign": "^4.0.1",
        "thenify-all": "^1.0.0"
      }
    },
    "node_modules/nanoid": {
      "version": "3.3.11",
      "resolved": "https://registry.npmjs.org/nanoid/-/nanoid-3.3.11.tgz",
      "integrity": "sha512-N8SpfPUnUp1bK+PMYW8qSWdl9U+wwNWI4QKxOYDy9JAro3WMX7p2OeVRF9v+347pnakNevPmiHhNmZ2HbFA76w==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "bin": {
        "nanoid": "bin/nanoid.cjs"
      },
      "engines": {
        "node": "^10 || ^12 || ^13.7 || ^14 || >=15.0.1"
      }
    },
    "node_modules/node-domexception": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/node-domexception/-/node-domexception-1.0.0.tgz",
      "integrity": "sha512-/jKZoMpw0F8GRwl4/eLROPA3cfcXtLApP0QzLmUT/HuPCZWyB7IY9ZrMeKw2O/nFIqPQB3PVM9aYm0F312AXDQ==",
      "deprecated": "Use your platform's native DOMException instead",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/jimmywarting"
        },
        {
          "type": "github",
          "url": "https://paypal.me/jimmywarting"
        }
      ],
      "engines": {
        "node": ">=10.5.0"
      }
    },
    "node_modules/node-fetch": {
      "version": "3.3.2",
      "resolved": "https://registry.npmjs.org/node-fetch/-/node-fetch-3.3.2.tgz",
      "integrity": "sha512-dRB78srN/l6gqWulah9SrxeYnxeddIG30+GOqK/9OlLVyLg3HPnr6SqOWTWOXKRwC2eGYCkZ59NNuSgvSrpgOA==",
      "dependencies": {
        "data-uri-to-buffer": "^4.0.0",
        "fetch-blob": "^3.1.4",
        "formdata-polyfill": "^4.0.10"
      },
      "engines": {
        "node": "^12.20.0 || ^14.13.1 || >=16.0.0"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/node-fetch"
      }
    },
    "node_modules/node-releases": {
      "version": "2.0.19",
      "resolved": "https://registry.npmjs.org/node-releases/-/node-releases-2.0.19.tgz",
      "integrity": "sha512-xxOWJsBKtzAq7DY0J+DTzuz58K8e7sJbdgwkbMWQe8UYB6ekmsQ45q0M/tJDsGaZmbC+l7n57UV8Hl5tHxO9uw=="
    },
    "node_modules/normalize-path": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/normalize-path/-/normalize-path-3.0.0.tgz",
      "integrity": "sha512-6eZs5Ls3WtCisHWp9S2GUy8dqkpGi4BVSz3GaqiE6ezub0512ESztXUwUB6C6IKbQkY2Pnb/mD4WYojCRwcwLA==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/normalize-range": {
      "version": "0.1.2",
      "resolved": "https://registry.npmjs.org/normalize-range/-/normalize-range-0.1.2.tgz",
      "integrity": "sha512-bdok/XvKII3nUpklnV6P2hxtMNrCboOjAcyBuQnWEhO665FwrSNRxU+AqpsyvO6LgGYPspN+lu5CLtw4jPRKNA==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/npm-normalize-package-bin": {
      "version": "4.0.0",
      "resolved": "https://registry.npmjs.org/npm-normalize-package-bin/-/npm-normalize-package-bin-4.0.0.tgz",
      "integrity": "sha512-TZKxPvItzai9kN9H/TkmCtx/ZN/hvr3vUycjlfmH0ootY9yFBzNOpiXAdIn1Iteqsvk4lQn6B5PTrt+n6h8k/w==",
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/object-assign": {
      "version": "4.1.1",
      "resolved": "https://registry.npmjs.org/object-assign/-/object-assign-4.1.1.tgz",
      "integrity": "sha512-rJgTQnkUnH1sFw8yT6VSU3zD3sWmu6sZhIseY8VX+GRu3P6F7Fu+JNDoXfklElbLJSnc3FUQHVe4cU5hj+BcUg==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/object-hash": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/object-hash/-/object-hash-3.0.0.tgz",
      "integrity": "sha512-RSn9F68PjH9HqtltsSnqYC1XXoWe9Bju5+213R98cNGttag9q9yAOTzdbsqvIa7aNm5WffBZFpWYr2aWrklWAw==",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/package-json-from-dist": {
      "version": "1.0.1",
      "resolved": "https://registry.npmjs.org/package-json-from-dist/-/package-json-from-dist-1.0.1.tgz",
      "integrity": "sha512-UEZIS3/by4OC8vL3P2dTXRETpebLI2NiI5vIrjaD/5UtrkFX/tNbwjTSRAGC/+7CAo2pIcBaRgWmcBBHcsaCIw=="
    },
    "node_modules/path-key": {
      "version": "3.1.1",
      "resolved": "https://registry.npmjs.org/path-key/-/path-key-3.1.1.tgz",
      "integrity": "sha512-ojmeN0qd+y0jszEtoY48r0Peq5dwMEkIlCOu6Q5f41lfkswXuKtYrhgoTpLnyIcHm24Uhqx+5Tqm2InSwLhE6Q==",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/path-parse": {
      "version": "1.0.7",
      "resolved": "https://registry.npmjs.org/path-parse/-/path-parse-1.0.7.tgz",
      "integrity": "sha512-LDJzPVEEEPR+y48z93A0Ed0yXb8pAByGWo/k5YYdYgpY2/2EsOsksJrq7lOHxryrVOn1ejG6oAp8ahvOIQD8sw=="
    },
    "node_modules/path-scurry": {
      "version": "1.11.1",
      "resolved": "https://registry.npmjs.org/path-scurry/-/path-scurry-1.11.1.tgz",
      "integrity": "sha512-Xa4Nw17FS9ApQFJ9umLiJS4orGjm7ZzwUrwamcGQuHSzDyth9boKDaycYdDcZDuqYATXw4HFXgaqWTctW/v1HA==",
      "dependencies": {
        "lru-cache": "^10.2.0",
        "minipass": "^5.0.0 || ^6.0.2 || ^7.0.0"
      },
      "engines": {
        "node": ">=16 || 14 >=14.18"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/picocolors": {
      "version": "1.1.1",
      "resolved": "https://registry.npmjs.org/picocolors/-/picocolors-1.1.1.tgz",
      "integrity": "sha512-xceH2snhtb5M9liqDsmEw56le376mTZkEX/jEb/RxNFyegNul7eNslCXP9FDj/Lcu0X8KEyMceP2ntpaHrDEVA=="
    },
    "node_modules/picomatch": {
      "version": "2.3.1",
      "resolved": "https://registry.npmjs.org/picomatch/-/picomatch-2.3.1.tgz",
      "integrity": "sha512-JU3teHTNjmE2VCGFzuY8EXzCDVwEqB2a8fsIvwaStHhAWJEeVd1o1QD80CU6+ZdEXXSLbSsuLwJjkCBWqRQUVA==",
      "engines": {
        "node": ">=8.6"
      },
      "funding": {
        "url": "https://github.com/sponsors/jonschlinkert"
      }
    },
    "node_modules/pify": {
      "version": "2.3.0",
      "resolved": "https://registry.npmjs.org/pify/-/pify-2.3.0.tgz",
      "integrity": "sha512-udgsAY+fTnvv7kI7aaxbqwWNb0AHiB0qBO89PZKPkoTmGOgdbrHDKD+0B2X4uTfJ/FT1R09r9gTsjUjNJotuog==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/pirates": {
      "version": "4.0.7",
      "resolved": "https://registry.npmjs.org/pirates/-/pirates-4.0.7.tgz",
      "integrity": "sha512-TfySrs/5nm8fQJDcBDuUng3VOUKsd7S+zqvbOTiGXHfxX4wK31ard+hoNuvkicM/2YFzlpDgABOevKSsB4G/FA==",
      "engines": {
        "node": ">= 6"
      }
    },
    "node_modules/postcss": {
      "version": "8.5.6",
      "resolved": "https://registry.npmjs.org/postcss/-/postcss-8.5.6.tgz",
      "integrity": "sha512-3Ybi1tAuwAP9s0r1UQ2J4n5Y0G05bJkpUIO0/bI9MhwmD70S5aTWbXGBwxHrelT+XM1k6dM0pk+SwNkpTRN7Pg==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/postcss"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "nanoid": "^3.3.11",
        "picocolors": "^1.1.1",
        "source-map-js": "^1.2.1"
      },
      "engines": {
        "node": "^10 || ^12 || >=14"
      }
    },
    "node_modules/postcss-import": {
      "version": "15.1.0",
      "resolved": "https://registry.npmjs.org/postcss-import/-/postcss-import-15.1.0.tgz",
      "integrity": "sha512-hpr+J05B2FVYUAXHeK1YyI267J/dDDhMU6B6civm8hSY1jYJnBXxzKDKDswzJmtLHryrjhnDjqqp/49t8FALew==",
      "dependencies": {
        "postcss-value-parser": "^4.0.0",
        "read-cache": "^1.0.0",
        "resolve": "^1.1.7"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "postcss": "^8.0.0"
      }
    },
    "node_modules/postcss-js": {
      "version": "4.0.1",
      "resolved": "https://registry.npmjs.org/postcss-js/-/postcss-js-4.0.1.tgz",
      "integrity": "sha512-dDLF8pEO191hJMtlHFPRa8xsizHaM82MLfNkUHdUtVEV3tgTp5oj+8qbEqYM57SLfc74KSbw//4SeJma2LRVIw==",
      "dependencies": {
        "camelcase-css": "^2.0.1"
      },
      "engines": {
        "node": "^12 || ^14 || >= 16"
      },
      "funding": {
        "type": "opencollective",
        "url": "https://opencollective.com/postcss/"
      },
      "peerDependencies": {
        "postcss": "^8.4.21"
      }
    },
    "node_modules/postcss-load-config": {
      "version": "4.0.2",
      "resolved": "https://registry.npmjs.org/postcss-load-config/-/postcss-load-config-4.0.2.tgz",
      "integrity": "sha512-bSVhyJGL00wMVoPUzAVAnbEoWyqRxkjv64tUl427SKnPrENtq6hJwUojroMz2VB+Q1edmi4IfrAPpami5VVgMQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "lilconfig": "^3.0.0",
        "yaml": "^2.3.4"
      },
      "engines": {
        "node": ">= 14"
      },
      "peerDependencies": {
        "postcss": ">=8.0.9",
        "ts-node": ">=9.0.0"
      },
      "peerDependenciesMeta": {
        "postcss": {
          "optional": true
        },
        "ts-node": {
          "optional": true
        }
      }
    },
    "node_modules/postcss-nested": {
      "version": "6.2.0",
      "resolved": "https://registry.npmjs.org/postcss-nested/-/postcss-nested-6.2.0.tgz",
      "integrity": "sha512-HQbt28KulC5AJzG+cZtj9kvKB93CFCdLvog1WFLf1D+xmMvPGlBstkpTEZfK5+AN9hfJocyBFCNiqyS48bpgzQ==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/postcss/"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "postcss-selector-parser": "^6.1.1"
      },
      "engines": {
        "node": ">=12.0"
      },
      "peerDependencies": {
        "postcss": "^8.2.14"
      }
    },
    "node_modules/postcss-selector-parser": {
      "version": "6.1.2",
      "resolved": "https://registry.npmjs.org/postcss-selector-parser/-/postcss-selector-parser-6.1.2.tgz",
      "integrity": "sha512-Q8qQfPiZ+THO/3ZrOrO0cJJKfpYCagtMUkXbnEfmgUjwXg6z/WBeOyS9APBBPCTSiDV+s4SwQGu8yFsiMRIudg==",
      "dependencies": {
        "cssesc": "^3.0.0",
        "util-deprecate": "^1.0.2"
      },
      "engines": {
        "node": ">=4"
      }
    },
    "node_modules/postcss-value-parser": {
      "version": "4.2.0",
      "resolved": "https://registry.npmjs.org/postcss-value-parser/-/postcss-value-parser-4.2.0.tgz",
      "integrity": "sha512-1NNCs6uurfkVbeXG4S8JFT9t19m45ICnif8zWLd5oPSZ50QnwMfK+H3jv408d4jw/7Bttv5axS5IiHoLaVNHeQ=="
    },
    "node_modules/postgres": {
      "version": "3.4.7",
      "resolved": "https://registry.npmjs.org/postgres/-/postgres-3.4.7.tgz",
      "integrity": "sha512-Jtc2612XINuBjIl/QTWsV5UvE8UHuNblcO3vVADSrKsrc6RqGX6lOW1cEo3CM2v0XG4Nat8nI+YM7/f26VxXLw==",
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "type": "individual",
        "url": "https://github.com/sponsors/porsager"
      }
    },
    "node_modules/proc-log": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/proc-log/-/proc-log-5.0.0.tgz",
      "integrity": "sha512-Azwzvl90HaF0aCz1JrDdXQykFakSSNPaPoiZ9fm5qJIMHioDZEi7OAdRwSm6rSoPtY3Qutnm3L7ogmg3dc+wbQ==",
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/proxy-from-env": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/proxy-from-env/-/proxy-from-env-1.1.0.tgz",
      "integrity": "sha512-D+zkORCbA9f1tdWRK0RaCR3GPv50cMxcrz4X8k5LTSUD1Dkw47mKJEZQNunItRTkWwgtaUSo1RVFRIG9ZXiFYg=="
    },
    "node_modules/queue-microtask": {
      "version": "1.2.3",
      "resolved": "https://registry.npmjs.org/queue-microtask/-/queue-microtask-1.2.3.tgz",
      "integrity": "sha512-NuaNSa6flKT5JaSYQzJok04JzTL1CA6aGhv5rfLW3PgqA+M2ChpZQnAC8h8i4ZFkBS8X5RqkDBHA7r4hej3K9A==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ]
    },
    "node_modules/react": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react/-/react-18.3.1.tgz",
      "integrity": "sha512-wS+hAgJShR0KhEvPJArfuPVN1+Hz1t0Y6n5jLrGQbkb4urgPE/0Rve+1kMB1v/oWgHgm4WIcV+i7F2pTVj+2iQ==",
      "dependencies": {
        "loose-envify": "^1.1.0"
      },
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/react-dom": {
      "version": "18.3.1",
      "resolved": "https://registry.npmjs.org/react-dom/-/react-dom-18.3.1.tgz",
      "integrity": "sha512-5m4nQKp+rZRb09LNH59GM4BxTh9251/ylbKIbpe7TpGxfJ+9kv6BLkLBXIjjspbgbnIBNqlI23tRnTWT0snUIw==",
      "dependencies": {
        "loose-envify": "^1.1.0",
        "scheduler": "^0.23.2"
      },
      "peerDependencies": {
        "react": "^18.3.1"
      }
    },
    "node_modules/react-hot-toast": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/react-hot-toast/-/react-hot-toast-2.6.0.tgz",
      "integrity": "sha512-bH+2EBMZ4sdyou/DPrfgIouFpcRLCJ+HoCA32UoAYHn6T3Ur5yfcDCeSr5mwldl6pFOsiocmrXMuoCJ1vV8bWg==",
      "dependencies": {
        "csstype": "^3.1.3",
        "goober": "^2.1.16"
      },
      "engines": {
        "node": ">=10"
      },
      "peerDependencies": {
        "react": ">=16",
        "react-dom": ">=16"
      }
    },
    "node_modules/react-hot-toast/node_modules/csstype": {
      "version": "3.1.3",
      "resolved": "https://registry.npmjs.org/csstype/-/csstype-3.1.3.tgz",
      "integrity": "sha512-M1uQkMl8rQK/szD0LNhtqxIPLpimGm8sOBwU7lLnCpSbTyY3yeU1Vc7l4KT5zT4s/yOxHH5O7tIuuLOCnLADRw=="
    },
    "node_modules/react-router": {
      "version": "6.30.1",
      "resolved": "https://registry.npmjs.org/react-router/-/react-router-6.30.1.tgz",
      "integrity": "sha512-X1m21aEmxGXqENEPG3T6u0Th7g0aS4ZmoNynhbs+Cn+q+QGTLt+d5IQ2bHAXKzKcxGJjxACpVbnYQSCRcfxHlQ==",
      "dependencies": {
        "@remix-run/router": "1.23.0"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8"
      }
    },
    "node_modules/react-router-dom": {
      "version": "6.30.1",
      "resolved": "https://registry.npmjs.org/react-router-dom/-/react-router-dom-6.30.1.tgz",
      "integrity": "sha512-llKsgOkZdbPU1Eg3zK8lCn+sjD9wMRZZPuzmdWWX5SUs8OFkN5HnFVC0u5KMeMaC9aoancFI/KoLuKPqN+hxHw==",
      "dependencies": {
        "@remix-run/router": "1.23.0",
        "react-router": "6.30.1"
      },
      "engines": {
        "node": ">=14.0.0"
      },
      "peerDependencies": {
        "react": ">=16.8",
        "react-dom": ">=16.8"
      }
    },
    "node_modules/react-scripts": {
      "version": "0.0.0",
      "resolved": "https://registry.npmjs.org/react-scripts/-/react-scripts-0.0.0.tgz",
      "integrity": "sha512-W7cVfdhbIvYrTjVaryO7WCpvzODu8V7JH/1O36RcfuzP3Cxjp5WpX5ycaoGt0LSQpntrem5jFSUoJrtvru1reA=="
    },
    "node_modules/read-cache": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/read-cache/-/read-cache-1.0.0.tgz",
      "integrity": "sha512-Owdv/Ft7IjOgm/i0xvNDZ1LrRANRfew4b2prF3OWMQLxLfu3bS8FVhCsrSCMK4lR56Y9ya+AThoTpDCTxCmpRA==",
      "dependencies": {
        "pify": "^2.3.0"
      }
    },
    "node_modules/read-cmd-shim": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/read-cmd-shim/-/read-cmd-shim-5.0.0.tgz",
      "integrity": "sha512-SEbJV7tohp3DAAILbEMPXavBjAnMN0tVnh4+9G8ihV4Pq3HYF9h8QNez9zkJ1ILkv9G2BjdzwctznGZXgu/HGw==",
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/readdirp": {
      "version": "3.6.0",
      "resolved": "https://registry.npmjs.org/readdirp/-/readdirp-3.6.0.tgz",
      "integrity": "sha512-hOS089on8RduqdbhvQ5Z37A0ESjsqz6qnRcffsMU3495FuTdqSm+7bhJ29JvIOsBDEEnan5DPu9t3To9VRlMzA==",
      "dependencies": {
        "picomatch": "^2.2.1"
      },
      "engines": {
        "node": ">=8.10.0"
      }
    },
    "node_modules/resolve": {
      "version": "1.22.10",
      "resolved": "https://registry.npmjs.org/resolve/-/resolve-1.22.10.tgz",
      "integrity": "sha512-NPRy+/ncIMeDlTAsuqwKIiferiawhefFJtkNSW0qZJEqMEb+qBt/77B/jGeeek+F0uOeN05CDa6HXbbIgtVX4w==",
      "dependencies": {
        "is-core-module": "^2.16.0",
        "path-parse": "^1.0.7",
        "supports-preserve-symlinks-flag": "^1.0.0"
      },
      "bin": {
        "resolve": "bin/resolve"
      },
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/reusify": {
      "version": "1.1.0",
      "resolved": "https://registry.npmjs.org/reusify/-/reusify-1.1.0.tgz",
      "integrity": "sha512-g6QUff04oZpHs0eG5p83rFLhHeV00ug/Yf9nZM6fLeUrPguBTkTQOdpAWWspMh55TZfVQDPaN3NQJfbVRAxdIw==",
      "engines": {
        "iojs": ">=1.0.0",
        "node": ">=0.10.0"
      }
    },
    "node_modules/run-parallel": {
      "version": "1.2.0",
      "resolved": "https://registry.npmjs.org/run-parallel/-/run-parallel-1.2.0.tgz",
      "integrity": "sha512-5l4VyZR86LZ/lDxZTR6jqL8AFE2S0IFLMP26AbjsLVADxHdhB/c0GUsH+y39UfCi3dzz8OlQuPmnaJOMoDHQBA==",
      "funding": [
        {
          "type": "github",
          "url": "https://github.com/sponsors/feross"
        },
        {
          "type": "patreon",
          "url": "https://www.patreon.com/feross"
        },
        {
          "type": "consulting",
          "url": "https://feross.org/support"
        }
      ],
      "dependencies": {
        "queue-microtask": "^1.2.2"
      }
    },
    "node_modules/scheduler": {
      "version": "0.23.2",
      "resolved": "https://registry.npmjs.org/scheduler/-/scheduler-0.23.2.tgz",
      "integrity": "sha512-UOShsPwz7NrMUqhR6t0hWjFduvOzbtv7toDH1/hIrfRNIDBnnBWd0CwJTGvTpngVlmwGCdP9/Zl/tVrDqcuYzQ==",
      "dependencies": {
        "loose-envify": "^1.1.0"
      }
    },
    "node_modules/shebang-command": {
      "version": "2.0.0",
      "resolved": "https://registry.npmjs.org/shebang-command/-/shebang-command-2.0.0.tgz",
      "integrity": "sha512-kHxr2zZpYtdmrN1qDjrrX/Z1rR1kG8Dx+gkpK1G4eXmvXswmcE1hTWBWYUzlraYw1/yZp6YuDY77YtvbN0dmDA==",
      "dependencies": {
        "shebang-regex": "^3.0.0"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/shebang-regex": {
      "version": "3.0.0",
      "resolved": "https://registry.npmjs.org/shebang-regex/-/shebang-regex-3.0.0.tgz",
      "integrity": "sha512-7++dFhtcx3353uBaq8DDR4NuxBetBzC7ZQOhmTQInHEd6bSrXdiEyzCvG07Z44UYdLShWUyXt5M/yhz8ekcb1A==",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/signal-exit": {
      "version": "4.1.0",
      "resolved": "https://registry.npmjs.org/signal-exit/-/signal-exit-4.1.0.tgz",
      "integrity": "sha512-bzyZ1e88w9O1iNJbKnOlvYTrWPDl46O1bG0D3XInv+9tkPrxrN8jUUTiFlDkkmKWgn1M6CfIA13SuGqOa9Korw==",
      "engines": {
        "node": ">=14"
      },
      "funding": {
        "url": "https://github.com/sponsors/isaacs"
      }
    },
    "node_modules/source-map-js": {
      "version": "1.2.1",
      "resolved": "https://registry.npmjs.org/source-map-js/-/source-map-js-1.2.1.tgz",
      "integrity": "sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==",
      "engines": {
        "node": ">=0.10.0"
      }
    },
    "node_modules/string-width": {
      "version": "5.1.2",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-5.1.2.tgz",
      "integrity": "sha512-HnLOCR3vjcY8beoNLtcjZ5/nxn2afmME6lhrDrebokqMap+XbeW8n9TXpPDOqdGK5qcI3oT0GKTW6wC7EMiVqA==",
      "dependencies": {
        "eastasianwidth": "^0.2.0",
        "emoji-regex": "^9.2.2",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/sponsors/sindresorhus"
      }
    },
    "node_modules/string-width-cjs": {
      "name": "string-width",
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/string-width-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A=="
    },
    "node_modules/string-width-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi": {
      "version": "7.1.0",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-7.1.0.tgz",
      "integrity": "sha512-iq6eVVI64nQQTRYq2KtEg2d2uU7LElhTJwsH4YzIHZshxlgZms/wIc4VoDQTlG/IvVIrBKG06CrZnp0qv7hkcQ==",
      "dependencies": {
        "ansi-regex": "^6.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/strip-ansi?sponsor=1"
      }
    },
    "node_modules/strip-ansi-cjs": {
      "name": "strip-ansi",
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/strip-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/sucrase": {
      "version": "3.35.0",
      "resolved": "https://registry.npmjs.org/sucrase/-/sucrase-3.35.0.tgz",
      "integrity": "sha512-8EbVDiu9iN/nESwxeSxDKe0dunta1GOlHufmSSXxMD2z2/tMZpDMpvXQGsc+ajGo8y2uYUmixaSRUc/QPoQ0GA==",
      "dependencies": {
        "@jridgewell/gen-mapping": "^0.3.2",
        "commander": "^4.0.0",
        "glob": "^10.3.10",
        "lines-and-columns": "^1.1.6",
        "mz": "^2.7.0",
        "pirates": "^4.0.1",
        "ts-interface-checker": "^0.1.9"
      },
      "bin": {
        "sucrase": "bin/sucrase",
        "sucrase-node": "bin/sucrase-node"
      },
      "engines": {
        "node": ">=16 || 14 >=14.17"
      }
    },
    "node_modules/supabase": {
      "version": "2.39.2",
      "resolved": "https://registry.npmjs.org/supabase/-/supabase-2.39.2.tgz",
      "integrity": "sha512-/LDPMDIDmuDwj3UsKVw+wA+uHF7QhEF8xgJnKpnk1vqVdr+lA6xRSwWQzgaNuwPj5YPt6+78JKp+wzKziTsRVw==",
      "hasInstallScript": true,
      "dependencies": {
        "bin-links": "^5.0.0",
        "https-proxy-agent": "^7.0.2",
        "node-fetch": "^3.3.2",
        "tar": "7.4.3"
      },
      "bin": {
        "supabase": "bin/supabase"
      },
      "engines": {
        "npm": ">=8"
      }
    },
    "node_modules/supports-preserve-symlinks-flag": {
      "version": "1.0.0",
      "resolved": "https://registry.npmjs.org/supports-preserve-symlinks-flag/-/supports-preserve-symlinks-flag-1.0.0.tgz",
      "integrity": "sha512-ot0WnXS9fgdkgIcePe6RHNk1WA8+muPa6cSjeR3V8K27q9BB1rTE3R1p7Hv0z1ZyAc8s6Vvv8DIyWf681MAt0w==",
      "engines": {
        "node": ">= 0.4"
      },
      "funding": {
        "url": "https://github.com/sponsors/ljharb"
      }
    },
    "node_modules/swr": {
      "version": "2.2.0",
      "resolved": "https://registry.npmjs.org/swr/-/swr-2.2.0.tgz",
      "integrity": "sha512-AjqHOv2lAhkuUdIiBu9xbuettzAzWXmCEcLONNKJRba87WAefz8Ca9d6ds/SzrPc235n1IxWYdhJ2zF3MNUaoQ==",
      "dependencies": {
        "use-sync-external-store": "^1.2.0"
      },
      "peerDependencies": {
        "react": "^16.11.0 || ^17.0.0 || ^18.0.0"
      }
    },
    "node_modules/tailwind-merge": {
      "version": "2.6.0",
      "resolved": "https://registry.npmjs.org/tailwind-merge/-/tailwind-merge-2.6.0.tgz",
      "integrity": "sha512-P+Vu1qXfzediirmHOC3xKGAYeZtPcV9g76X+xg2FD4tYgR71ewMA35Y3sCz3zhiN/dwefRpJX0yBcgwi1fXNQA==",
      "funding": {
        "type": "github",
        "url": "https://github.com/sponsors/dcastil"
      }
    },
    "node_modules/tailwindcss": {
      "version": "3.4.17",
      "resolved": "https://registry.npmjs.org/tailwindcss/-/tailwindcss-3.4.17.tgz",
      "integrity": "sha512-w33E2aCvSDP0tW9RZuNXadXlkHXqFzSkQew/aIa2i/Sj8fThxwovwlXHSPXTbAHwEIhBFXAedUhP2tueAKP8Og==",
      "dependencies": {
        "@alloc/quick-lru": "^5.2.0",
        "arg": "^5.0.2",
        "chokidar": "^3.6.0",
        "didyoumean": "^1.2.2",
        "dlv": "^1.1.3",
        "fast-glob": "^3.3.2",
        "glob-parent": "^6.0.2",
        "is-glob": "^4.0.3",
        "jiti": "^1.21.6",
        "lilconfig": "^3.1.3",
        "micromatch": "^4.0.8",
        "normalize-path": "^3.0.0",
        "object-hash": "^3.0.0",
        "picocolors": "^1.1.1",
        "postcss": "^8.4.47",
        "postcss-import": "^15.1.0",
        "postcss-js": "^4.0.1",
        "postcss-load-config": "^4.0.2",
        "postcss-nested": "^6.2.0",
        "postcss-selector-parser": "^6.1.2",
        "resolve": "^1.22.8",
        "sucrase": "^3.35.0"
      },
      "bin": {
        "tailwind": "lib/cli.js",
        "tailwindcss": "lib/cli.js"
      },
      "engines": {
        "node": ">=14.0.0"
      }
    },
    "node_modules/tar": {
      "version": "7.4.3",
      "resolved": "https://registry.npmjs.org/tar/-/tar-7.4.3.tgz",
      "integrity": "sha512-5S7Va8hKfV7W5U6g3aYxXmlPoZVAwUMy9AOKyF2fVuZa2UD3qZjg578OrLRt8PcNN1PleVaL/5/yYATNL0ICUw==",
      "dependencies": {
        "@isaacs/fs-minipass": "^4.0.0",
        "chownr": "^3.0.0",
        "minipass": "^7.1.2",
        "minizlib": "^3.0.1",
        "mkdirp": "^3.0.1",
        "yallist": "^5.0.0"
      },
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/thenify": {
      "version": "3.3.1",
      "resolved": "https://registry.npmjs.org/thenify/-/thenify-3.3.1.tgz",
      "integrity": "sha512-RVZSIV5IG10Hk3enotrhvz0T9em6cyHBLkH/YAZuKqd8hRkKhSfCGIcP2KUY0EPxndzANBmNllzWPwak+bheSw==",
      "dependencies": {
        "any-promise": "^1.0.0"
      }
    },
    "node_modules/thenify-all": {
      "version": "1.6.0",
      "resolved": "https://registry.npmjs.org/thenify-all/-/thenify-all-1.6.0.tgz",
      "integrity": "sha512-RNxQH/qI8/t3thXJDwcstUO4zeqo64+Uy/+sNVRBx4Xn2OX+OZ9oP+iJnNFqplFra2ZUVeKCSa2oVWi3T4uVmA==",
      "dependencies": {
        "thenify": ">= 3.1.0 < 4"
      },
      "engines": {
        "node": ">=0.8"
      }
    },
    "node_modules/to-regex-range": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/to-regex-range/-/to-regex-range-5.0.1.tgz",
      "integrity": "sha512-65P7iz6X5yEr1cwcgvQxbbIw7Uk3gOy5dIdtZ4rDveLqhrdJP+Li/Hx6tyK0NEb+2GCyneCMJiGqrADCSNk8sQ==",
      "dependencies": {
        "is-number": "^7.0.0"
      },
      "engines": {
        "node": ">=8.0"
      }
    },
    "node_modules/ts-interface-checker": {
      "version": "0.1.13",
      "resolved": "https://registry.npmjs.org/ts-interface-checker/-/ts-interface-checker-0.1.13.tgz",
      "integrity": "sha512-Y/arvbn+rrz3JCKl9C4kVNfTfSm2/mEp5FSz5EsZSANGPSlQrpRI5M4PKF+mJnE52jOO90PnPSc3Ur3bTQw0gA=="
    },
    "node_modules/tslib": {
      "version": "2.4.1",
      "resolved": "https://registry.npmjs.org/tslib/-/tslib-2.4.1.tgz",
      "integrity": "sha512-tGyy4dAjRIEwI7BzsB0lynWgOpfqjUdq91XXAlIWD2OwKBH7oCl/GZG/HT4BOHrTlPMOASlMQ7veyTqpmRcrNA=="
    },
    "node_modules/update-browserslist-db": {
      "version": "1.1.3",
      "resolved": "https://registry.npmjs.org/update-browserslist-db/-/update-browserslist-db-1.1.3.tgz",
      "integrity": "sha512-UxhIZQ+QInVdunkDAaiazvvT/+fXL5Osr0JZlJulepYu6Jd7qJtDZjlur0emRlT71EN3ScPoE7gvsuIKKNavKw==",
      "funding": [
        {
          "type": "opencollective",
          "url": "https://opencollective.com/browserslist"
        },
        {
          "type": "tidelift",
          "url": "https://tidelift.com/funding/github/npm/browserslist"
        },
        {
          "type": "github",
          "url": "https://github.com/sponsors/ai"
        }
      ],
      "dependencies": {
        "escalade": "^3.2.0",
        "picocolors": "^1.1.1"
      },
      "bin": {
        "update-browserslist-db": "cli.js"
      },
      "peerDependencies": {
        "browserslist": ">= 4.21.0"
      }
    },
    "node_modules/use-sync-external-store": {
      "version": "1.5.0",
      "resolved": "https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.5.0.tgz",
      "integrity": "sha512-Rb46I4cGGVBmjamjphe8L/UnvJD+uPPtTkNvX5mZgqdbavhI4EbgIWJiIHXJ8bc/i9EQGPRh4DwEURJ552Do0A==",
      "peerDependencies": {
        "react": "^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0"
      }
    },
    "node_modules/util-deprecate": {
      "version": "1.0.2",
      "resolved": "https://registry.npmjs.org/util-deprecate/-/util-deprecate-1.0.2.tgz",
      "integrity": "sha512-EPD5q1uXyFxJpCrLnCc1nHnq3gOa6DZBocAIiI2TaSCA7VCJ1UJDMagCzIkXNsUYfD1daK//LTEQ8xiIbrHtcw=="
    },
    "node_modules/web-streams-polyfill": {
      "version": "3.3.3",
      "resolved": "https://registry.npmjs.org/web-streams-polyfill/-/web-streams-polyfill-3.3.3.tgz",
      "integrity": "sha512-d2JWLCivmZYTSIoge9MsgFCZrt571BikcWGYkjC1khllbTeDlGqZ2D8vD8E/lJa8WGWbb7Plm8/XJYV7IJHZZw==",
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/which": {
      "version": "2.0.2",
      "resolved": "https://registry.npmjs.org/which/-/which-2.0.2.tgz",
      "integrity": "sha512-BLI3Tl1TW3Pvl70l3yq3Y64i+awpwXqsGBYWkkqMtnbXgrMD+yj7rhW0kuEDxzJaYXGjEW5ogapKNMEKNMjibA==",
      "dependencies": {
        "isexe": "^2.0.0"
      },
      "bin": {
        "node-which": "bin/node-which"
      },
      "engines": {
        "node": ">= 8"
      }
    },
    "node_modules/wrap-ansi": {
      "version": "8.1.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-8.1.0.tgz",
      "integrity": "sha512-si7QWI6zUMq56bESFvagtmzMdGOtoxfR+Sez11Mobfc7tm+VkUckk9bW2UeffTGVUbOksxmSw0AA2gs8g71NCQ==",
      "dependencies": {
        "ansi-styles": "^6.1.0",
        "string-width": "^5.0.1",
        "strip-ansi": "^7.0.1"
      },
      "engines": {
        "node": ">=12"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs": {
      "name": "wrap-ansi",
      "version": "7.0.0",
      "resolved": "https://registry.npmjs.org/wrap-ansi/-/wrap-ansi-7.0.0.tgz",
      "integrity": "sha512-YVGIj2kamLSTxw6NsZjoBxfSwsn0ycdesmc4p+Q21c5zPuZ1pl+NfxVdxPtdHvmNVOQ6XSYG4AUtyt/Fi7D16Q==",
      "dependencies": {
        "ansi-styles": "^4.0.0",
        "string-width": "^4.1.0",
        "strip-ansi": "^6.0.0"
      },
      "engines": {
        "node": ">=10"
      },
      "funding": {
        "url": "https://github.com/chalk/wrap-ansi?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/ansi-regex": {
      "version": "5.0.1",
      "resolved": "https://registry.npmjs.org/ansi-regex/-/ansi-regex-5.0.1.tgz",
      "integrity": "sha512-quJQXlTSUGL2LH9SUXo8VwsY4soanhgo6LNSm84E1LBcE8s3O0wpdiRzyR9z/ZZJMlMWv37qOOb9pdJlMUEKFQ==",
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/ansi-styles": {
      "version": "4.3.0",
      "resolved": "https://registry.npmjs.org/ansi-styles/-/ansi-styles-4.3.0.tgz",
      "integrity": "sha512-zbB9rCJAT1rbjiVDb2hqKFHNYLxgtk8NURxZ3IZwD3F6NtxbXZQCnnSi1Lkx+IDohdPlFp222wVALIheZJQSEg==",
      "dependencies": {
        "color-convert": "^2.0.1"
      },
      "engines": {
        "node": ">=8"
      },
      "funding": {
        "url": "https://github.com/chalk/ansi-styles?sponsor=1"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/emoji-regex": {
      "version": "8.0.0",
      "resolved": "https://registry.npmjs.org/emoji-regex/-/emoji-regex-8.0.0.tgz",
      "integrity": "sha512-MSjYzcWNOA0ewAHpz0MxpYFvwg6yjy1NG3xteoqz644VCo/RPgnr1/GGt+ic3iJTzQ8Eu3TdM14SawnVUmGE6A=="
    },
    "node_modules/wrap-ansi-cjs/node_modules/string-width": {
      "version": "4.2.3",
      "resolved": "https://registry.npmjs.org/string-width/-/string-width-4.2.3.tgz",
      "integrity": "sha512-wKyQRQpjJ0sIp62ErSZdGsjMJWsap5oRNihHhu6G7JVO/9jIB6UyevL+tXuOqrng8j/cxKTWyWUwvSTriiZz/g==",
      "dependencies": {
        "emoji-regex": "^8.0.0",
        "is-fullwidth-code-point": "^3.0.0",
        "strip-ansi": "^6.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/wrap-ansi-cjs/node_modules/strip-ansi": {
      "version": "6.0.1",
      "resolved": "https://registry.npmjs.org/strip-ansi/-/strip-ansi-6.0.1.tgz",
      "integrity": "sha512-Y38VPSHcqkFrCpFnQ9vuSXmquuv5oXOKpGeT6aGrr3o3Gc9AlVa6JBfUSOCnbxGGZF+/0ooI7KrPuUSztUdU5A==",
      "dependencies": {
        "ansi-regex": "^5.0.1"
      },
      "engines": {
        "node": ">=8"
      }
    },
    "node_modules/write-file-atomic": {
      "version": "6.0.0",
      "resolved": "https://registry.npmjs.org/write-file-atomic/-/write-file-atomic-6.0.0.tgz",
      "integrity": "sha512-GmqrO8WJ1NuzJ2DrziEI2o57jKAVIQNf8a18W3nCYU3H7PNWqCCVTeH6/NQE93CIllIgQS98rrmVkYgTX9fFJQ==",
      "dependencies": {
        "imurmurhash": "^0.1.4",
        "signal-exit": "^4.0.1"
      },
      "engines": {
        "node": "^18.17.0 || >=20.5.0"
      }
    },
    "node_modules/yallist": {
      "version": "5.0.0",
      "resolved": "https://registry.npmjs.org/yallist/-/yallist-5.0.0.tgz",
      "integrity": "sha512-YgvUTfwqyc7UXVMrB+SImsVYSmTS8X/tSrtdNZMImM+n7+QTriRXyXim0mBrTXNeqzVF0KWGgHPeiyViFFrNDw==",
      "engines": {
        "node": ">=18"
      }
    },
    "node_modules/yaml": {
      "version": "2.8.1",
      "resolved": "https://registry.npmjs.org/yaml/-/yaml-2.8.1.tgz",
      "integrity": "sha512-lcYcMxX2PO9XMGvAJkJ3OsNMw+/7FKes7/hgerGUYWIoWu5j/+YQqcZr5JnPZWzOsEBgMbSbiSTn/dv/69Mkpw==",
      "bin": {
        "yaml": "bin.mjs"
      },
      "engines": {
        "node": ">= 14.6"
      }
    }
  }
}

```

## frontend/src/styles/adhd-friendly.css
```
/* GestaltView Mobile & ADHD-Friendly Styles */
/* Optimized for Keith's consciousness platform with neurodivergent users in mind */

/* === TOUCH TARGETS & ACCESSIBILITY === */
/* Ensure all interactive elements meet minimum touch target size (44px) */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Extra large touch targets for ADHD users (easier to hit) */
.touch-target-large {
  min-height: 60px;
  min-width: 60px;
  padding: 12px;
}

/* === ADHD-FRIENDLY COLOR SYSTEM === */
/* High contrast colors for better focus */
:root {
  --adhd-focus-primary: #1E40AF; /* Deep blue for primary actions */
  --adhd-focus-secondary: #059669; /* Green for success/completion */
  --adhd-warning: #DC2626; /* Red for urgent/important */
  /* ... more colors */
}

/* === ADHD-SPECIFIC FEATURES === */
/* Hyperfocus indicator */
.hyperfocus-mode {
  border: 3px solid var(--adhd-energy);
  animation: hyperfocus-pulse 2s infinite;
}

/* Overwhelm protection - simplified interface */
.overwhelm-mode .distracting-element {
  display: none !important;
}

```

## frontend/src/styles/index.css
```
:root {
  /* Primitive Color Tokens */
  --color-white: rgba(255, 255, 255, 1);
  --color-black: rgba(0, 0, 0, 1);
  --color-cream-50: rgba(252, 252, 249, 1);
  --color-cream-100: rgba(255, 255, 253, 1);
  --color-gray-200: rgba(245, 245, 245, 1);
  --color-gray-300: rgba(167, 169, 169, 1);
  --color-gray-400: rgba(119, 124, 124, 1);
  --color-slate-500: rgba(98, 108, 113, 1);
  --color-brown-600: rgba(94, 82, 64, 1);
  --color-charcoal-700: rgba(31, 33, 33, 1);
  --color-charcoal-800: rgba(38, 40, 40, 1);
  --color-slate-900: rgba(19, 52, 59, 1);
  --color-teal-300: rgba(50, 184, 198, 1);
  --color-teal-400: rgba(45, 166, 178, 1);
  --color-teal-500: rgba(33, 128, 141, 1);
  --color-teal-600: rgba(29, 116, 128, 1);
  --color-teal-700: rgba(26, 104, 115, 1);
  --color-teal-800: rgba(41, 150, 161, 1);
  --color-red-400: rgba(255, 84, 89, 1);
  --color-red-500: rgba(192, 21, 47, 1);
  --color-orange-400: rgba(230, 129, 97, 1);
  --color-orange-500: rgba(168, 75, 47, 1);

  /* RGB versions for opacity control */
  --color-brown-600-rgb: 94, 82, 64;
  --color-teal-500-rgb: 33, 128, 141;
  --color-slate-900-rgb: 19, 52, 59;
  --color-slate-500-rgb: 98, 108, 113;
  --color-red-500-rgb: 192, 21, 47;
  --color-red-400-rgb: 255, 84, 89;
  --color-orange-500-rgb: 168, 75, 47;
  --color-orange-400-rgb: 230, 129, 97;

  /* Background color tokens (Light Mode) */
  --color-bg-1: rgba(59, 130, 246, 0.08); /* Light blue */
  --color-bg-2: rgba(245, 158, 11, 0.08); /* Light yellow */
  --color-bg-3: rgba(34, 197, 94, 0.08); /* Light green */
  --color-bg-4: rgba(239, 68, 68, 0.08); /* Light red */
  --color-bg-5: rgba(147, 51, 234, 0.08); /* Light purple */
  --color-bg-6: rgba(249, 115, 22, 0.08); /* Light orange */
  --color-bg-7: rgba(236, 72, 153, 0.08); /* Light pink */
  --color-bg-8: rgba(6, 182, 212, 0.08); /* Light cyan */

  /* Semantic Color Tokens (Light Mode) */
  --color-background: var(--color-cream-50);
  --color-surface: var(--color-cream-100);
  --color-text: var(--color-slate-900);
  --color-text-secondary: var(--color-slate-500);
  --color-primary: var(--color-teal-500);
  --color-primary-hover: var(--color-teal-600);
  --color-primary-active: var(--color-teal-700);
  --color-secondary: rgba(var(--color-brown-600-rgb), 0.12);
  --color-secondary-hover: rgba(var(--color-brown-600-rgb), 0.2);
  --color-secondary-active: rgba(var(--color-brown-600-rgb), 0.25);
  --color-border: rgba(var(--color-brown-600-rgb), 0.2);
  --color-btn-primary-text: var(--color-cream-50);
  --color-card-border: rgba(var(--color-brown-600-rgb), 0.12);
  --color-card-border-inner: rgba(var(--color-brown-600-rgb), 0.12);
  --color-error: var(--color-red-500);
  --color-success: var(--color-teal-500);
  --color-warning: var(--color-orange-500);
  --color-info: var(--color-slate-500);
  --color-focus-ring: rgba(var(--color-teal-500-rgb), 0.4);
  --color-select-caret: rgba(var(--color-slate-900-rgb), 0.8);

  /* Common style patterns */
  --focus-ring: 0 0 0 3px var(--color-focus-ring);
  --focus-outline: 2px solid var(--color-primary);
  --status-bg-opacity: 0.15;
  --status-border-opacity: 0.25;
  --select-caret-light: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23134252' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  --select-caret-dark: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f5f5f5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");

  /* RGB versions for opacity control */
  --color-success-rgb: 33, 128, 141;
  --color-error-rgb: 192, 21, 47;
  --color-warning-rgb: 168, 75, 47;
  --color-info-rgb: 98, 108, 113;

  /* Typography */
  --font-family-base: "FKGroteskNeue", "Geist", "Inter", -apple-system,
    BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-family-mono: "Berkeley Mono", ui-monospace, SFMono-Regular, Menlo,
    Monaco, Consolas, monospace;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-md: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
  --font-size-3xl: 24px;
  --font-size-4xl: 30px;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 550;
  --font-weight-bold: 600;
  --line-height-tight: 1.2;
  --line-height-normal: 1.5;
  --letter-spacing-tight: -0.01em;

  /* Spacing */
  --space-0: 0;
  --space-1: 1px;
  --space-2: 2px;
  --space-4: 4px;
  --space-6: 6px;
  --space-8: 8px;
  --space-10: 10px;
  --space-12: 12px;
  --space-16: 16px;
  --space-20: 20px;
  --space-24: 24px;
  --space-32: 32px;

  /* Border Radius */
  --radius-sm: 6px;
  --radius-base: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.04),
    0 2px 4px -1px rgba(0, 0, 0, 0.02);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.04),
    0 4px 6px -2px rgba(0, 0, 0, 0.02);
  --shadow-inset-sm: inset 0 1px 0 rgba(255, 255, 255, 0.15),
    inset 0 -1px 0 rgba(0, 0, 0, 0.03);

  /* Animation */
  --duration-fast: 150ms;
  --duration-normal: 250ms;
  --ease-standard: cubic-bezier(0.16, 1, 0.3, 1);

  /* Layout */
  --container-sm: 640px;
  --container-md: 768px;
  --container-lg: 1024px;
  --container-xl: 1280px;
}

/* Dark mode colors */
@media (prefers-color-scheme: dark) {
  :root {
    /* RGB versions for opacity control (Dark Mode) */
    --color-gray-400-rgb: 119, 124, 124;
    --color-teal-300-rgb: 50, 184, 198;
    --color-gray-300-rgb: 167, 169, 169;
    --color-gray-200-rgb: 245, 245, 245;

    /* Background color tokens (Dark Mode) */
    --color-bg-1: rgba(29, 78, 216, 0.15); /* Dark blue */
    --color-bg-2: rgba(180, 83, 9, 0.15); /* Dark yellow */
    --color-bg-3: rgba(21, 128, 61, 0.15); /* Dark green */
    --color-bg-4: rgba(185, 28, 28, 0.15); /* Dark red */
    --color-bg-5: rgba(107, 33, 168, 0.15); /* Dark purple */
    --color-bg-6: rgba(194, 65, 12, 0.15); /* Dark orange */
    --color-bg-7: rgba(190, 24, 93, 0.15); /* Dark pink */
    --color-bg-8: rgba(8, 145, 178, 0.15); /* Dark cyan */
    
    /* Semantic Color Tokens (Dark Mode) */
    --color-background: var(--color-charcoal-700);
    --color-surface: var(--color-charcoal-800);
    --color-text: var(--color-gray-200);
    --color-text-secondary: rgba(var(--color-gray-300-rgb), 0.7);
    --color-primary: var(--color-teal-300);
    --color-primary-hover: var(--color-teal-400);
    --color-primary-active: var(--color-teal-800);
    --color-secondary: rgba(var(--color-gray-400-rgb), 0.15);
    --color-secondary-hover: rgba(var(--color-gray-400-rgb), 0.25);
    --color-secondary-active: rgba(var(--color-gray-400-rgb), 0.3);
    --color-border: rgba(var(--color-gray-400-rgb), 0.3);
    --color-error: var(--color-red-400);
    --color-success: var(--color-teal-300);
    --color-warning: var(--color-orange-400);
    --color-info: var(--color-gray-300);
    --color-focus-ring: rgba(var(--color-teal-300-rgb), 0.4);
    --color-btn-primary-text: var(--color-slate-900);
    --color-card-border: rgba(var(--color-gray-400-rgb), 0.2);
    --color-card-border-inner: rgba(var(--color-gray-400-rgb), 0.15);
    --shadow-inset-sm: inset 0 1px 0 rgba(255, 255, 255, 0.1),
      inset 0 -1px 0 rgba(0, 0, 0, 0.15);
    --button-border-secondary: rgba(var(--color-gray-400-rgb), 0.2);
    --color-border-secondary: rgba(var(--color-gray-400-rgb), 0.2);
    --color-select-caret: rgba(var(--color-gray-200-rgb), 0.8);

    /* Common style patterns - updated for dark mode */
    --focus-ring: 0 0 0 3px var(--color-focus-ring);
    --focus-outline: 2px solid var(--color-primary);
    --status-bg-opacity: 0.15;
    --status-border-opacity: 0.25;
    --select-caret-light: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23134252' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    --select-caret-dark: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f5f5f5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");

    /* RGB versions for dark mode */
    --color-success-rgb: var(--color-teal-300-rgb);
    --color-error-rgb: var(--color-red-400-rgb);
    --color-warning-rgb: var(--color-orange-400-rgb);
    --color-info-rgb: var(--color-gray-300-rgb);
  }
}

/* Data attribute for manual theme switching */
[data-color-scheme="dark"] {
  /* RGB versions for opacity control (dark mode) */
  --color-gray-400-rgb: 119, 124, 124;
  --color-teal-300-rgb: 50, 184, 198;
  --color-gray-300-rgb: 167, 169, 169;
  --color-gray-200-rgb: 245, 245, 245;

  /* Colorful background palette - Dark Mode */
  --color-bg-1: rgba(29, 78, 216, 0.15); /* Dark blue */
  --color-bg-2: rgba(180, 83, 9, 0.15); /* Dark yellow */
  --color-bg-3: rgba(21, 128, 61, 0.15); /* Dark green */
  --color-bg-4: rgba(185, 28, 28, 0.15); /* Dark red */
  --color-bg-5: rgba(107, 33, 168, 0.15); /* Dark purple */
  --color-bg-6: rgba(194, 65, 12, 0.15); /* Dark orange */
  --color-bg-7: rgba(190, 24, 93, 0.15); /* Dark pink */
  --color-bg-8: rgba(8, 145, 178, 0.15); /* Dark cyan */
  
  /* Semantic Color Tokens (Dark Mode) */
  --color-background: var(--color-charcoal-700);
  --color-surface: var(--color-charcoal-800);
  --color-text: var(--color-gray-200);
  --color-text-secondary: rgba(var(--color-gray-300-rgb), 0.7);
  --color-primary: var(--color-teal-300);
  --color-primary-hover: var(--color-teal-400);
  --color-primary-active: var(--color-teal-800);
  --color-secondary: rgba(var(--color-gray-400-rgb), 0.15);
  --color-secondary-hover: rgba(var(--color-gray-400-rgb), 0.25);
  --color-secondary-active: rgba(var(--color-gray-400-rgb), 0.3);
  --color-border: rgba(var(--color-gray-400-rgb), 0.3);
  --color-error: var(--color-red-400);
  --color-success: var(--color-teal-300);
  --color-warning: var(--color-orange-400);
  --color-info: var(--color-gray-300);
  --color-focus-ring: rgba(var(--color-teal-300-rgb), 0.4);
  --color-btn-primary-text: var(--color-slate-900);
  --color-card-border: rgba(var(--color-gray-400-rgb), 0.15);
  --color-card-border-inner: rgba(var(--color-gray-400-rgb), 0.15);
  --shadow-inset-sm: inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15);
  --color-border-secondary: rgba(var(--color-gray-400-rgb), 0.2);
  --color-select-caret: rgba(var(--color-gray-200-rgb), 0.8);

  /* Common style patterns - updated for dark mode */
  --focus-ring: 0 0 0 3px var(--color-focus-ring);
  --focus-outline: 2px solid var(--color-primary);
  --status-bg-opacity: 0.15;
  --status-border-opacity: 0.25;
  --select-caret-light: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23134252' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  --select-caret-dark: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f5f5f5' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");

  /* RGB versions for dark mode */
  --color-success-rgb: var(--color-teal-300-rgb);
  --color-error-rgb: var(--color-red-400-rgb);
  --color-warning-rgb: var(--color-orange-400-rgb);
  --color-info-rgb: var(--color-gray-300-rgb);
}

[data-color-scheme="light"] {
  /* RGB versions for opacity control (light mode) */
  --color-brown-600-rgb: 94, 82, 64;
  --color-teal-500-rgb: 33, 128, 141;
  --color-slate-900-rgb: 19, 52, 59;
  
  /* Semantic Color Tokens (Light Mode) */
  --color-background: var(--color-cream-50);
  --color-surface: var(--color-cream-100);
  --color-text: var(--color-slate-900);
  --color-text-secondary: var(--color-slate-500);
  --color-primary: var(--color-teal-500);
  --color-primary-hover: var(--color-teal-600);
  --color-primary-active: var(--color-teal-700);
  --color-secondary: rgba(var(--color-brown-600-rgb), 0.12);
  --color-secondary-hover: rgba(var(--color-brown-600-rgb), 0.2);
  --color-secondary-active: rgba(var(--color-brown-600-rgb), 0.25);
  --color-border: rgba(var(--color-brown-600-rgb), 0.2);
  --color-btn-primary-text: var(--color-cream-50);
  --color-card-border: rgba(var(--color-brown-600-rgb), 0.12);
  --color-card-border-inner: rgba(var(--color-brown-600-rgb), 0.12);
  --color-error: var(--color-red-500);
  --color-success: var(--color-teal-500);
  --color-warning: var(--color-orange-500);
  --color-info: var(--color-slate-500);
  --color-focus-ring: rgba(var(--color-teal-500-rgb), 0.4);

  /* RGB versions for light mode */
  --color-success-rgb: var(--color-teal-500-rgb);
  --color-error-rgb: var(--color-red-500-rgb);
  --color-warning-rgb: var(--color-orange-500-rgb);
  --color-info-rgb: var(--color-slate-500-rgb);
}

/* Base styles */
html {
  font-size: var(--font-size-base);
  font-family: var(--font-family-base);
  line-height: var(--line-height-normal);
  color: var(--color-text);
  background-color: var(--color-background);
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
}

*,
*::before,
*::after {
  box-sizing: inherit;
}

/* Typography */
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: var(--color-text);
  letter-spacing: var(--letter-spacing-tight);
}

h1 {
  font-size: var(--font-size-4xl);
}
h2 {
  font-size: var(--font-size-3xl);
}
h3 {
  font-size: var(--font-size-2xl);
}
h4 {
  font-size: var(--font-size-xl);
}
h5 {
  font-size: var(--font-size-lg);
}
h6 {
  font-size: var(--font-size-md);
}

p {
  margin: 0 0 var(--space-16) 0;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--duration-fast) var(--ease-standard);
}

a:hover {
  color: var(--color-primary-hover);
}

code,
pre {
  font-family: var(--font-family-mono);
  font-size: calc(var(--font-size-base) * 0.95);
  background-color: var(--color-secondary);
  border-radius: var(--radius-sm);
}

code {
  padding: var(--space-1) var(--space-4);
}

pre {
  padding: var(--space-16);
  margin: var(--space-16) 0;
  overflow: auto;
  border: 1px solid var(--color-border);
}

pre code {
  background: none;
  padding: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8) var(--space-16);
  border-radius: var(--radius-base);
  font-size: var(--font-size-base);
  font-weight: 500;
  line-height: 1.5;
  cursor: pointer;
  transition: all var(--duration-normal) var(--ease-standard);
  border: none;
  text-decoration: none;
  position: relative;
}

.btn:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.btn--primary {
  background: var(--color-primary);
  color: var(--color-btn-primary-text);
}

.btn--primary:hover {
  background: var(--color-primary-hover);
}

.btn--primary:active {
  background: var(--color-primary-active);
}

.btn--secondary {
  background: var(--color-secondary);
  color: var(--color-text);
}

.btn--secondary:hover {
  background: var(--color-secondary-hover);
}

.btn--secondary:active {
  background: var(--color-secondary-active);
}

.btn--outline {
  background: transparent;
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn--outline:hover {
  background: var(--color-secondary);
}

.btn--sm {
  padding: var(--space-4) var(--space-12);
  font-size: var(--font-size-sm);
  border-radius: var(--radius-sm);
}

.btn--lg {
  padding: var(--space-10) var(--space-20);
  font-size: var(--font-size-lg);
  border-radius: var(--radius-md);
}

.btn--full-width {
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Form elements */
.form-control {
  display: block;
  width: 100%;
  padding: var(--space-8) var(--space-12);
  font-size: var(--font-size-md);
  line-height: 1.5;
  color: var(--color-text);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-base);
  transition: border-color var(--duration-fast) var(--ease-standard),
    box-shadow var(--duration-fast) var(--ease-standard);
}

textarea.form-control {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
}

select.form-control {
  padding: var(--space-8) var(--space-12);
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-image: var(--select-caret-light);
  background-repeat: no-repeat;
  background-position: right var(--space-12) center;
  background-size: 16px;
  padding-right: var(--space-32);
}

/* Add a dark mode specific caret */
@media (prefers-color-scheme: dark) {
  select.form-control {
    background-image: var(--select-caret-dark);
  }
}

/* Also handle data-color-scheme */
[data-color-scheme="dark"] select.form-control {
  background-image: var(--select-caret-dark);
}

[data-color-scheme="light"] select.form-control {
  background-image: var(--select-caret-light);
}

.form-control:focus {
  border-color: var(--color-primary);
  outline: var(--focus-outline);
}

.form-label {
  display: block;
  margin-bottom: var(--space-8);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.form-group {
  margin-bottom: var(--space-16);
}

/* Card component */
.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-card-border);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow var(--duration-normal) var(--ease-standard);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.card__body {
  padding: var(--space-16);
}

.card__header,
.card__footer {
  padding: var(--space-16);
  border-bottom: 1px solid var(--color-card-border-inner);
}

/* Status indicators - simplified with CSS variables */
.status {
  display: inline-flex;
  align-items: center;
  padding: var(--space-6) var(--space-12);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.status--success {
  background-color: rgba(
    var(--color-success-rgb, 33, 128, 141),
    var(--status-bg-opacity)
  );
  color: var(--color-success);
  border: 1px solid
    rgba(var(--color-success-rgb, 33, 128, 141), var(--status-border-opacity));
}

.status--error {
  background-color: rgba(
    var(--color-error-rgb, 192, 21, 47),
    var(--status-bg-opacity)
  );
  color: var(--color-error);
  border: 1px solid
    rgba(var(--color-error-rgb, 192, 21, 47), var(--status-border-opacity));
}

.status--warning {
  background-color: rgba(
    var(--color-warning-rgb, 168, 75, 47),
    var(--status-bg-opacity)
  );
  color: var(--color-warning);
  border: 1px solid
    rgba(var(--color-warning-rgb, 168, 75, 47), var(--status-border-opacity));
}

.status--info {
  background-color: rgba(
    var(--color-info-rgb, 98, 108, 113),
    var(--status-bg-opacity)
  );
  color: var(--color-info);
  border: 1px solid
    rgba(var(--color-info-rgb, 98, 108, 113), var(--status-border-opacity));
}

/* Container layout */
.container {
  width: 100%;
  margin-right: auto;
  margin-left: auto;
  padding-right: var(--space-16);
  padding-left: var(--space-16);
}

@media (min-width: 640px) {
  .container {
    max-width: var(--container-sm);
  }
}
@media (min-width: 768px) {
  .container {
    max-width: var(--container-md);
  }
}
@media (min-width: 1024px) {
  .container {
    max-width: var(--container-lg);
  }
}
@media (min-width: 1280px) {
  .container {
    max-width: var(--container-xl);
  }
}

/* Utility classes */
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
.justify-between {
  justify-content: space-between;
}
.gap-4 {
  gap: var(--space-4);
}
.gap-8 {
  gap: var(--space-8);
}
.gap-16 {
  gap: var(--space-16);
}

.m-0 {
  margin: 0;
}
.mt-8 {
  margin-top: var(--space-8);
}
.mb-8 {
  margin-bottom: var(--space-8);
}
.mx-8 {
  margin-left: var(--space-8);
  margin-right: var(--space-8);
}
.my-8 {
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
}

.p-0 {
  padding: 0;
}
.py-8 {
  padding-top: var(--space-8);
  padding-bottom: var(--space-8);
}
.px-8 {
  padding-left: var(--space-8);
  padding-right: var(--space-8);
}
.py-16 {
  padding-top: var(--space-16);
  padding-bottom: var(--space-16);
}
.px-16 {
  padding-left: var(--space-16);
  padding-right: var(--space-16);
}

.block {
  display: block;
}
.hidden {
  display: none;
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

:focus-visible {
  outline: var(--focus-outline);
  outline-offset: 2px;
}

/* Dark mode specifics */
[data-color-scheme="dark"] .btn--outline {
  border: 1px solid var(--color-border-secondary);
}

@font-face {
  font-family: 'FKGroteskNeue';
  src: url('https://r2cdn.perplexity.ai/fonts/FKGroteskNeue.woff2')
    format('woff2');
}

/* END PERPLEXITY DESIGN SYSTEM */
```css
/* Keith's Neural Aurora Consciousness Theme */
/* Complete integration for GestaltView with ADHD-friendly features */

/* =================================================================================
 * 1. CSS CUSTOM PROPERTIES & THEME VARIABLES
 * ================================================================================= */

:root {
    /* Keith's Neural Aurora Gradient Variables - Updated with Design System Colors */
    --neural-primary: linear-gradient(135deg, var(--color-charcoal-700), var(--color-slate-900), var(--color-charcoal-800));
    --aurora-gradient: linear-gradient(135deg, var(--color-teal-400), var(--color-teal-300), var(--color-teal-800));
    --consciousness-glow: rgba(var(--color-teal-500-rgb), 0.4);
    
    /* Base Theme Variables using Design System */
    --background: var(--color-background);
    --foreground: var(--color-text);
    --card: var(--color-surface);
    --card-foreground: var(--color-text);
    --primary: var(--color-primary);
    --primary-foreground: var(--color-btn-primary-text);
    --secondary: var(--color-secondary);
    --secondary-foreground: var(--color-text);
    --muted: var(--color-secondary);
    --muted-foreground: var(--color-text-secondary);
    --accent: var(--color-secondary);
    --accent-foreground: var(--color-text);
    --border: var(--color-border);
    --input: var(--color-border);
    --ring: var(--color-focus-ring);
    --radius: var(--radius-base);

    /* Keith's Custom Variables - Updated */
    --font-keith: var(--font-family-base);
    --radius-consciousness: var(--radius-lg);
    --adhd-energy: var(--color-warning);
    --ember-colors: var(--color-success), var(--color-teal-400), var(--color-teal-300), var(--color-teal-800), var(--color-primary), var(--color-warning);
}

.dark {
    /* Dark theme inherits from design system dark mode variables */
    --neural-primary: linear-gradient(135deg, var(--color-charcoal-700), var(--color-slate-900), var(--color-charcoal-800));
    --consciousness-glow: rgba(var(--color-teal-300-rgb), 0.4);
}

/* =================================================================================
 * 2. BASE STYLES & NEURAL AURORA BACKGROUND
 * ================================================================================= */

* {
    border-color: var(--border);
    box-sizing: border-box;
}

body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-keith);
    min-height: 100vh;
    background: var(--neural-primary);
    color: var(--color-gray-200);
    margin: 0;
    padding: 0;
}

/* Neural Aurora Gradient Application */
.aurora-bg {
    background: var(--neural-primary);
    color: var(--color-gray-200);
}

.aurora-text {
    background: var(--aurora-gradient);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* =================================================================================
 * 3. COMPONENT STYLES WITH GLASSMORPHISM
 * ================================================================================= */

.component, .card, .tribunal-persona-card {
    background: rgba(var(--color-gray-200-rgb), 0.1);
    border: 1px solid rgba(var(--color-gray-200-rgb), 0.2);
    border-radius: var(--radius-consciousness);
    padding: var(--space-24);
    box-shadow: var(--shadow-lg);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    transition: all var(--duration-normal) var(--ease-standard);
    color: var(--card-foreground);
    background-color: var(--card);
}

.dark .component, .dark .card, .dark .tribunal-persona-card {
    background: rgba(var(--color-charcoal-800-rgb, 38, 40, 40), 0.5);
    border-color: rgba(var(--color-gray-400-rgb), 0.1);
}

.component:hover, .card:hover, .tribunal-persona-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg), 0 6px 35px rgba(0, 0, 0, 0.2);
}

/* =================================================================================
 * 4. FLOATING EMBERS ANIMATION SYSTEM
 * ================================================================================= */

.floating-ember {
    position: absolute;
    bottom: -20px;
    border-radius: var(--radius-full);
    pointer-events: none;
    animation: float-up 10s linear infinite;
    z-index: -1;
}

@keyframes float-up {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 1;
        filter: blur(0px);
    }
    50% {
        filter: blur(1px);
    }
    100% {
        transform: translateY(-110vh) rotate(360deg);
        opacity: 0;
        filter: blur(2px);
    }
}

/* Advanced ember variations */
.floating-ember.ember-large {
    width: var(--space-8) !important;
    height: var(--space-8) !important;
    animation-duration: 12s !important;
}

.floating-ember.ember-small {
    width: var(--space-2) !important;
    height: var(--space-2) !important;
    animation-duration: 8s !important;
}

/* =================================================================================
 * 5. ADHD-FRIENDLY & ACCESSIBILITY FEATURES
 * ================================================================================= */

.touch-target {
    min-height: 44px;
    min-width: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--duration-fast) var(--ease-standard);
}

.touch-target:active {
    transform: scale(0.95);
}

.touch-target:hover {
    transform: scale(1.05);
}

/* Hyperfocus mode with consciousness glow */
.hyperfocus-mode {
    border: 3px solid var(--adhd-energy);
    animation: hyperfocus-pulse 2s infinite;
    box-shadow: 0 0 20px var(--consciousness-glow);
}

@keyframes hyperfocus-pulse {
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(var(--color-warning-rgb), 0.4), 0 0 20px var(--consciousness-glow); 
    }
    50% { 
        box-shadow: 0 0 0 var(--space-8) rgba(var(--color-warning-rgb), 0), 0 0 40px var(--consciousness-glow); 
    }
}

/* Overwhelm protection mode */
.overwhelm-mode .distracting-element {
    display: none !important;
}

.overwhelm-mode .component {
    animation: gentle-breathing 4s ease-in-out infinite;
}

@keyframes gentle-breathing {
    0%, 100% { transform: scale(1); opacity: 0.9; }
    50% { transform: scale(1.01); opacity: 1; }
}

/* =================================================================================
 * 6. CONSCIOUSNESS STATE INDICATORS
 * ================================================================================= */

.consciousness-state-indicator {
    position: relative;
    overflow: hidden;
}

.consciousness-state-indicator::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(45deg, var(--color-primary), var(--color-teal-300), var(--color-teal-800), var(--color-success));
    background-size: 200% 200%;
    animation: gradient-shift 3s ease infinite;
    border-radius: inherit;
    z-index: -1;
}

@keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

/* =================================================================================
 * 7. INTERACTIVE ELEMENTS & BUTTONS
 * ================================================================================= */

.btn-neural {
    padding: var(--space-12) var(--space-24);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-base);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    transform: scale(1);
    transition: all var(--duration-fast) var(--ease-standard);
    background: linear-gradient(135deg, var(--color-teal-400), var(--color-primary));
    color: var(--color-btn-primary-text);
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.btn-neural:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-lg), 0 8px 25px rgba(var(--color-primary-rgb, 33, 128, 141), 0.3);
}

.btn-neural:active {
    transform: scale(0.98);
}

.btn-neural:focus {
    outline: none;
    box-shadow: var(--focus-ring);
}

/* =================================================================================
 * 8. CHAT INTERFACE STYLING
 * ================================================================================= */

.message-user {
    background: linear-gradient(to right, var(--color-teal-500), var(--color-primary));
    color: var(--color-btn-primary-text);
    border-radius: var(--radius-lg);
    border-bottom-right-radius: var(--radius-sm);
    padding: var(--space-16);
    max-width: 320px;
    margin-left: auto;
    backdrop-filter: blur(10px);
}

.message-ai {
    color: var(--color-gray-100);
    border-radius: var(--radius-lg);
    border-bottom-left-radius: var(--radius-sm);
    padding: var(--space-16);
    max-width: 448px;
    box-shadow: var(--shadow-sm);
    background: rgba(var(--color-gray-200-rgb), 0.1);
    border: 1px solid rgba(var(--color-gray-200-rgb), 0.2);
    backdrop-filter: blur(10px);
}

/* Task breakdown with neural styling */
.task-step {
    display: flex;
    align-items: center;
    padding: var(--space-12);
    border-radius: var(--radius-base);
    border-left: 4px solid var(--color-teal-400);
    margin-bottom: var(--space-8);
    transition: all var(--duration-fast) var(--ease-standard);
    background: rgba(var(--color-teal-400-rgb), 0.1);
    color: var(--color-gray-100);
}

.task-step:hover {
    background: rgba(var(--color-teal-400-rgb), 0.2);
    transform: translateX(var(--space-4));
}

.task-step.completed {
    background: rgba(var(--color-success-rgb), 0.1);
    border-left-color: var(--color-success);
}

/* =================================================================================
 * 9. LOADING & ANIMATION STATES
 * ================================================================================= */

.typing-indicator {
    display: flex;
    gap: var(--space-4);
}

.typing-dot {
    width: var(--space-8);
    height: var(--space-8);
    border-radius: var(--radius-full);
    animation: pulse 1.5s ease-in-out infinite;
    background: linear-gradient(135deg, var(--color-teal-400), var(--color-primary));
    animation-delay: var(--delay);
}

/* Neural consciousness loading */
.consciousness-loading {
    animation: neural-pulse 2s ease-in-out infinite;
}

@keyframes neural-pulse {
    0%, 100% {
        box-shadow: 0 0 0 0 rgba(var(--color-teal-400-rgb), 0.7);
    }
    70% {
        box-shadow: 0 0 0 15px rgba(var(--color-teal-400-rgb), 0);
    }
}

/* =================================================================================
 * 10. RESPONSIVE DESIGN & MOBILE OPTIMIZATION
 * ================================================================================= */

@media (max-width: 480px) {
    .component, .card, .tribunal-persona-card {
        padding: var(--space-16);
        margin: var(--space-8);
        border-radius: var(--radius-base);
    }
    
    .touch-target {
        min-height: 48px;
        min-width: 48px;
    }
    
    .floating-ember {
        display: none; /* Reduce animation load on mobile */
    }
    
    .btn-neural {
        padding: var(--space-10) var(--space-20);
        font-size: var(--font-size-base);
        width: 100%;
        margin-bottom: var(--space-8);
    }
    
    .message-user, .message-ai {
        max-width: calc(100% - var(--space-32));
        padding: var(--space-12);
    }
    
    .task-step {
        padding: var(--space-10);
        margin-bottom: var(--space-6);
    }
    
    .aurora-text {
        font-size: var(--font-size-lg);
    }
}

@media (max-width: 640px) {
    .component, .card, .tribunal-persona-card {
        padding: var(--space-16);
        margin: var(--space-8);
    }
    
    .touch-target {
        min-height: 48px;
        min-width: 48px;
    }
    
    .floating-ember {
        display: none;
    }
}

/* =================================================================================
 * 11. ACCESSIBILITY & REDUCED MOTION
 * ================================================================================= */

@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
    
    .floating-ember {
        display: none;
    }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
    .component, .card, .tribunal-persona-card {
        border: 2px solid var(--color-white);
        background: rgba(var(--color-black-rgb, 0, 0, 0), 0.8);
    }
    
    .aurora-text {
        background: var(--color-white);
        -webkit-background-clip: text;
        background-clip: text;
    }
}

/* =================================================================================
 * 12. SCROLLBAR CUSTOMIZATION
 * ================================================================================= */

::-webkit-scrollbar {
    width: var(--space-8);
}

::-webkit-scrollbar-track {
    background: rgba(var(--color-charcoal-700-rgb, 31, 33, 33), 0.3);
    border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--color-teal-400), var(--color-primary));
    border-radius: var(--radius-sm);
}

::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--color-teal-600), var(--color-primary-hover));
}

/* =================================================================================
 * 13. UTILITY CLASSES FOR GESTALTVIEW
 * ================================================================================= */

.neural-glow {
    box-shadow: 0 0 20px var(--consciousness-glow);
}

.consciousness-border {
    border-image: linear-gradient(135deg, var(--color-teal-400), var(--color-primary), var(--color-teal-800)) 1;
}

.adhd-focus-ring:focus {
    outline: none;
    box-shadow: var(--focus-ring);
    border-color: var(--adhd-energy);
}

/* Bucket drops capture animation */
.bucket-drop-captured {
    animation: capture-spark 0.6s ease-out;
}

@keyframes capture-spark {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.8;
        box-shadow: 0 0 30px var(--consciousness-glow);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Musical DNA visualization */
.musical-dna-pulse {
    animation: dna-rhythm 3s ease-in-out infinite;
}

@keyframes dna-rhythm {
    0%, 100% { 
        transform: scale(1) rotate(0deg);
        filter: hue-rotate(0deg);
    }
    33% { 
        transform: scale(1.05) rotate(120deg);
        filter: hue-rotate(120deg);
    }
    66% { 
        transform: scale(0.95) rotate(240deg);
        filter: hue-rotate(240deg);
    }
}

```

## frontend/src/styles/mobile-adhd.css
```
/* GestaltView Mobile & ADHD-Friendly Styles */
/* Optimized for Keith's consciousness platform with neurodivergent users in mind */

/* === TOUCH TARGETS & ACCESSIBILITY === */

/* Ensure all interactive elements meet minimum touch target size (44px) */
.touch-target {
    min-height: 44px;
    min-width: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

/* Extra large touch targets for ADHD users (easier to hit) */
.touch-target-large {
    min-height: 60px;
    min-width: 60px;
    padding: 12px;
}

/* Visual feedback for touch interactions */
.touch-feedback {
    transition: all 0.2s ease;
    transform-origin: center;
}

.touch-feedback:active {
    transform: scale(0.95);
    opacity: 0.8;
}

.touch-feedback:focus {
    outline: 3px solid #3B82F6;
    outline-offset: 2px;
    border-radius: 8px;
}

/* === ADHD-FRIENDLY COLOR SYSTEM === */

/* High contrast colors for better focus */
:root {
    --adhd-focus-primary: #1E40AF;    /* Deep blue for primary actions */
    --adhd-focus-secondary: #059669;  /* Green for success/completion */
    --adhd-warning: #DC2626;          /* Red for urgent/important */
    --adhd-calm: #6366F1;             /* Purple for calming elements */
    --adhd-energy: #F59E0B;           /* Amber for energy/hyperfocus */
    --adhd-text-high: #111827;        /* High contrast text */
    --adhd-text-medium: #4B5563;      /* Medium contrast text */
    --adhd-bg-primary: #F9FAFB;       /* Clean, calm background */
    --adhd-bg-secondary: #F3F4F6;     /* Subtle contrast background */
    --adhd-border: #E5E7EB;           /* Gentle borders */
}

/* === MOBILE RESPONSIVE BREAKPOINTS === */

/* Extra small devices (phones, 320px and up) */
@media (min-width: 320px) {
    .container-xs {
        max-width: 100%;
        padding: 16px;
    }
    
    .text-xs-responsive {
        font-size: 14px;
        line-height: 1.5;
    }
    
    .button-xs {
        padding: 12px 16px;
        font-size: 14px;
        font-weight: 500;
    }
}

/* Small devices (landscape phones, 576px and up) */
@media (min-width: 576px) {
    .container-sm {
        max-width: 540px;
        margin: 0 auto;
        padding: 20px;
    }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
    .container-md {
        max-width: 720px;
        margin: 0 auto;
        padding: 24px;
    }
    
    .touch-target {
        min-height: 40px;
        min-width: 40px;
    }
}

/* === TRIBUNAL INTERFACE MOBILE OPTIMIZATION === */

.tribunal-mobile {
    width: 100%;
    max-width: 100vw;
    overflow-x: hidden;
}

.tribunal-personas {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
}

@media (min-width: 768px) {
    .tribunal-personas {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 16px;
    }
}

.tribunal-persona-card {
    background: var(--adhd-bg-primary);
    border: 2px solid var(--adhd-border);
    border-radius: 12px;
    padding: 16px;
    min-height: 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    transition: all 0.3s ease;
    cursor: pointer;
}

.tribunal-persona-card:hover {
    border-color: var(--adhd-focus-primary);
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.tribunal-persona-card.active {
    border-color: var(--adhd-focus-primary);
    background: linear-gradient(135deg, #EBF4FF 0%, #DBEAFE 100%);
}

/* === BUCKET DROPS MOBILE INTERFACE === */

.bucket-drops-mobile {
    padding: 16px;
    width: 100%;
}

.bucket-drop-input {
    width: 100%;
    min-height: 120px;
    padding: 16px;
    border: 2px solid var(--adhd-border);
    border-radius: 12px;
    font-size: 16px; /* Prevents zoom on iOS */
    line-height: 1.5;
    background: var(--adhd-bg-primary);
    resize: vertical;
    transition: border-color 0.3s ease;
}

.bucket-drop-input:focus {
    outline: none;
    border-color: var(--adhd-focus-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.bucket-drop-input::placeholder {
    color: var(--adhd-text-medium);
    font-style: italic;
}

/* Quick capture button for lightning-fast thoughts */
.lightning-capture-btn {
    position: fixed;
    bottom: 80px;
    right: 20px;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--adhd-energy) 0%, #F97316 100%);
    color: white;
    border: none;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
    z-index: 1000;
    transition: all 0.3s ease;
}

.lightning-capture-btn:active {
    transform: scale(0.9);
}

.lightning-capture-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

/* === MOBILE NAVIGATION === */

.mobile-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 2px solid var(--adhd-border);
    padding: 8px 16px 16px 16px; /* Extra bottom padding for home indicator */
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 1000;
}

.mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.3s ease;
    min-width: 60px;
    text-decoration: none;
    color: var(--adhd-text-medium);
}

.mobile-nav-item.active {
    color: var(--adhd-focus-primary);
    background: rgba(59, 130, 246, 0.1);
}

.mobile-nav-item:hover {
    background: var(--adhd-bg-secondary);
}

.mobile-nav-icon {
    font-size: 20px;
    margin-bottom: 4px;
}

.mobile-nav-label {
    font-size: 11px;
    font-weight: 500;
    text-align: center;
}

/* === ADHD-SPECIFIC FEATURES === */

/* Hyperfocus indicator */
.hyperfocus-mode {
    border: 3px solid var(--adhd-energy);
    background: linear-gradient(135deg, #FEF3C7 0%, #FCD34D 100%);
    animation: hyperfocus-pulse 2s infinite;
}

@keyframes hyperfocus-pulse {
    0%, 100% { 
        box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); 
    }
    50% { 
        box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.1); 
    }
}

/* Overwhelm protection - simplified interface */
.overwhelm-mode * {
    animation: none !important;
    transition: none !important;
}

.overwhelm-mode .distracting-element {
    display: none !important;
}

.overwhelm-mode {
    background: #FEFEFE !important;
    color: var(--adhd-text-high) !important;
}

/* Executive function support - clear visual hierarchy */
.executive-support {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.executive-step {
    background: var(--adhd-bg-primary);
    border-left: 4px solid var(--adhd-focus-primary);
    padding: 16px;
    border-radius: 0 8px 8px 0;
    position: relative;
}

.executive-step::before {
    content: attr(data-step);
    position: absolute;
    left: -20px;
    top: 50%;
    transform: translateY(-50%);
    background: var(--adhd-focus-primary);
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 14px;
}

.executive-step.completed {
    border-left-color: var(--adhd-focus-secondary);
    opacity: 0.7;
}

.executive-step.completed::before {
    background: var(--adhd-focus-secondary);
    content: "✓";
}

/* === CONSCIOUSNESS VISUALIZATION MOBILE === */

.consciousness-tapestry-mobile {
    width: 100%;
    overflow: hidden;
    border-radius: 12px;
    background: linear-gradient(135deg, #F0F9FF 0%, #E0E7FF 100%);
}

.consciousness-node {
    background: white;
    border: 2px solid var(--adhd-border);
    border-radius: 8px;
    padding: 12px;
    margin: 8px;
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
}

.consciousness-node:hover {
    border-color: var(--adhd-focus-primary);
    background: var(--adhd-bg-primary);
    transform: scale(1.02);
}

.consciousness-node.high-resonance {
    border-color: var(--adhd-focus-secondary);
    background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
}

/* === RESPONSIVE TYPOGRAPHY === */

.responsive-text-xl {
    font-size: 18px;
    line-height: 1.4;
}

.responsive-text-lg {
    font-size: 16px;
    line-height: 1.5;
}

.responsive-text-base {
    font-size: 14px;
    line-height: 1.5;
}

.responsive-text-sm {
    font-size: 12px;
    line-height: 1.4;
}

@media (min-width: 768px) {
    .responsive-text-xl { font-size: 24px; }
    .responsive-text-lg { font-size: 20px; }
    .responsive-text-base { font-size: 16px; }
    .responsive-text-sm { font-size: 14px; }
}

/* === LOADING STATES (ADHD-Friendly) === */

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid var(--adhd-border);
    border-top: 4px solid var(--adhd-focus-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-message {
    text-align: center;
    color: var(--adhd-text-medium);
    font-style: italic;
    margin-top: 16px;
}

/* === UTILITY CLASSES === */

.mobile-only {
    display: block;
}

.desktop-only {
    display: none;
}

@media (min-width: 768px) {
    .mobile-only {
        display: none;
    }
    .desktop-only {
        display: block;
    }
}

.no-scroll {
    overflow: hidden;
}

.safe-area-bottom {
    padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
    padding-top: env(safe-area-inset-top);
}

/* === ACCESSIBILITY IMPROVEMENTS === */

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.high-contrast {
    filter: contrast(1.2);
}

.reduced-motion {
    animation: none !important;
    transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}

/* === DARK MODE SUPPORT === */

@media (prefers-color-scheme: dark) {
    :root {
        --adhd-text-high: #F9FAFB;
        --adhd-text-medium: #D1D5DB;
        --adhd-bg-primary: #1F2937;
        --adhd-bg-secondary: #374151;
        --adhd-border: #4B5563;
    }
    
    .consciousness-tapestry-mobile {
        background: linear-gradient(135deg, #1E3A8A 0%, #3730A3 100%);
    }
}

```

## frontend/src/styles/Keith's_Neural_Aurora_Signature_Gradient.md
```


### 1. `index.html`

This file sets up the page, loads the necessary font from Google, uses a Tailwind CSS CDN for the utility classes, and includes containers for the UI and the ember animation.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Keith's Neural Aurora Theme</title>
    
    <!-- Google Font: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    
    <!-- Tailwind CSS via CDN (for utility classes used in the CSS file) -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Our Custom Theme Stylesheet -->
    <link rel="stylesheet" href="index.css">
</head>
<body class="transition-colors duration-500">
    
    <!-- Container for the floating embers animation -->
    <div id="ember-container" class="fixed inset-0 -z-10 pointer-events-none"></div>

    <main class="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8">
        <div class="max-w-4xl w-full flex flex-col items-center space-y-8">
            <!-- Header -->
            <header class="text-center">
                <h1 class="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 pb-2">
                    Neural Aurora Consciousness
                </h1>
                <p class="text-lg text-foreground/80">A demonstration of the theme's core features.</p>
            </header>

            <!-- Interactive Controls -->
            <div class="card flex flex-wrap gap-4 justify-center p-4">
                <button id="toggle-dark-mode" class="touch-target bg-secondary hover:bg-accent px-4 py-2 rounded-lg font-semibold">
                    Enable Dark Mode
                </button>
                <button id="toggle-embers" class="touch-target bg-secondary hover:bg-accent px-4 py-2 rounded-lg font-semibold">
                    Activate Embers
                </button>
                <button id="toggle-overwhelm" class="touch-target bg-secondary hover:bg-accent px-4 py-2 rounded-lg font-semibold">
                    Toggle Overwhelm Mode
                </button>
            </div>

            <!-- Component Showcase -->
            <div class="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Standard Card -->
                <div class="card space-y-3">
                    <h2 class="text-xl font-semibold">Standard Component</h2>
                    <p class="text-foreground/70">This is a standard card with the glassy, blurred background effect. It's the base for UI elements.</p>
                </div>
                
                <!-- Hyperfocus Card -->
                <div class="card space-y-3 hyperfocus-mode">
                    <h2 class="text-xl font-semibold">Hyperfocus Mode</h2>
                    <p class="text-foreground/70">This card demonstrates the ADHD-friendly focus state with a pulsing amber glow to draw attention.</p>
                </div>

                <!-- Overwhelm Mode Card -->
                <div class="tribunal-persona-card space-y-3">
                    <h2 class="text-xl font-semibold">Clutter Demonstration</h2>
                    <p class="text-foreground/70">This component contains a potentially distracting element below.</p>
                    <div class="distracting-element mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-md text-center">
                        ✨ A distracting animation or ad would go here! ✨
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Our Custom JavaScript -->
    <script src="app.js" defer></script>
</body>
</html>
```

---

### 2. `index.css`

This is the corrected CSS file from the previous answer. The `@import` statements for Tailwind are no longer needed because we are using the CDN in the HTML file.

```css
/* Keith's Neural Aurora Consciousness Theme */
/* REFACTORED: Corrected syntax errors, consolidated variables, and organized for clarity. */

/* NOTE: The @import rules for Tailwind are removed as we use a CDN in the HTML for this demo. */

/*
 * =================================================================================
 * 1. THEME & COLOR VARIABLES
 * =================================================================================
 */
@layer base {
  :root {
    /* Base Light Theme */
    --background: 0 0% 100%;
    --foreground: 0 0% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.9%;
    --primary: 0 0% 9%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96.1%;
    --secondary-foreground: 0 0% 9%;
    --muted: 0 0% 96.1%;
    --muted-foreground: 0 0% 45.1%;
    --accent: 0 0% 96.1%;
    --accent-foreground: 0 0% 9%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.9%;
    --radius: 0.5rem;

    /* Custom Theme Variables */
    --font-keith: "Inter", sans-serif;
    --radius-consciousness: 12px;

    /* ADHD-Friendly Accessibility Palette (Light Mode) */
    --adhd-energy: #F59E0B;
  }

  .dark {
    /* Base Dark Theme */
    --background: 0 0% 3.9%;
    --foreground: 0 0% 98%;
    --card: 0 0% 3.9%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 9%;
    --secondary: 0 0% 14.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 14.9%;
    --muted-foreground: 0 0% 63.9%;
    --accent: 0 0% 14.9%;
    --accent-foreground: 0 0% 98%;
    --border: 0 0% 14.9%;
    --input: 0 0% 14.9%;
    --ring: 0 0% 83.1%;
  }

  /*
   * =================================================================================
   * 2. BASE STYLES
   * =================================================================================
   */
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-family: var(--font-keith);
    min-height: 100vh;
  }

  /* Neural Aurora Gradient (Signature Background for Dark Mode) */
  .dark, .aurora-bg {
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    color: #f0f0f8;
  }
}

/*
 * =================================================================================
 * 3. COMPONENT STYLES
 * =================================================================================
 */
.component, .card, .tribunal-persona-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-consciousness);
  padding: 1.5rem; /* 24px */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px); /* For Safari support */
  transition: all 0.3s ease;
  color: hsl(var(--card-foreground));
  background-color: hsl(var(--card));
}

.dark .component, .dark .card, .dark .tribunal-persona-card {
    background: rgba(10, 10, 20, 0.5);
    border-color: rgba(255, 255, 255, 0.1);
}

.component:hover, .card:hover, .tribunal-persona-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 35px rgba(0, 0, 0, 0.2);
}

/*
 * =================================================================================
 * 4. FLOATING EMBERS ANIMATION
 * =================================================================================
 */
.floating-ember {
  position: absolute;
  bottom: -20px;
  border-radius: 50%;
  pointer-events: none;
  animation: float-up 10s linear infinite;
  z-index: -1;
}

@keyframes float-up {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-110vh);
    opacity: 0;
  }
}

/*
 * =================================================================================
 * 5. ADHD-FRIENDLY & ACCESSIBILITY STYLES
 * =================================================================================
 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.touch-target:active {
    transform: scale(0.95);
}

.hyperfocus-mode {
  border: 3px solid var(--adhd-energy);
  animation: hyperfocus-pulse 2s infinite;
}

@keyframes hyperfocus-pulse {
  0%, 100% { box-shadow: 0 0 0 0 hsla(38, 92%, 50%, 0.4); }
  50% { box-shadow: 0 0 0 8px hsla(38, 92%, 50%, 0); }
}

.overwhelm-mode .distracting-element {
  display: none !important;
}

/*
 * =================================================================================
 * 6. RESPONSIVENESS & REDUCED MOTION
 * =================================================================================
 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

### 3. `app.js`

This file contains the logic for toggling modes and generating the floating embers. It correctly implements the animation concept from the original file.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element Selectors ---
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    const emberContainer = document.getElementById('ember-container');
    const darkModeBtn = document.getElementById('toggle-dark-mode');
    const embersBtn = document.getElementById('toggle-embers');
    const overwhelmBtn = document.getElementById('toggle-overwhelm');

    // --- State Management ---
    let isEmbersActive = false;
    let emberInterval = null;

    // --- Dark Mode Toggle ---
    darkModeBtn.addEventListener('click', () => {
        htmlElement.classList.toggle('dark');
        const isDark = htmlElement.classList.contains('dark');
        darkModeBtn.textContent = isDark ? 'Enable Light Mode' : 'Enable Dark Mode';
    });

    // --- Overwhelm Mode Toggle ---
    overwhelmBtn.addEventListener('click', () => {
        bodyElement.classList.toggle('overwhelm-mode');
        const isOverwhelmed = bodyElement.classList.contains('overwhelm-mode');
        overwhelmBtn.textContent = isOverwhelmed ? 'Disable Overwhelm Mode' : 'Enable Overwhelm Mode';
    });

    // --- Floating Embers Logic ---
    const emberColors = ["#10B981", "#06B6D4", "#34D399", "#6EE7B7"];

    function createEmber() {
        const ember = document.createElement('div');
        ember.className = 'floating-ember';

        const size = Math.random() * 6 + 3; // 3px to 9px
        const speed = Math.random() * 8 + 6; // 6s to 14s duration
        
        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.left = `${Math.random() * 100}%`;
        ember.style.opacity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
        ember.style.backgroundColor = emberColors[Math.floor(Math.random() * emberColors.length)];
        ember.style.animationDuration = `${speed}s`;

        emberContainer.appendChild(ember);

        // Remove ember from DOM after animation completes to prevent buildup
        setTimeout(() => {
            ember.remove();
        }, speed * 1000);
    }

    function startEmbers() {
        if (isEmbersActive) return;
        isEmbersActive = true;
        embersBtn.textContent = 'Deactivate Embers';
        
        // Start a continuous stream of embers
        emberInterval = setInterval(createEmber, 200);
    }

    function stopEmbers() {
        if (!isEmbersActive) return;
        isEmbersActive = false;
        embersBtn.textContent = 'Activate Embers';

        clearInterval(emberInterval);
        // Optional: fade out existing embers for a smoother stop
        Array.from(emberContainer.children).forEach(ember => {
            ember.style.transition = 'opacity 0.5s ease';
            ember.style.opacity = 0;
            setTimeout(() => ember.remove(), 500);
        });
    }

    embersBtn.addEventListener('click', () => {
        if (isEmbersActive) {
            stopEmbers();
        } else {
            startEmbers();
        }
    });
});
```
```

## frontend/src/index.js
```
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/index.css';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error('Missing Publishable Key');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '0.5rem',
            },
          }}
        />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);

```

## frontend/src/App.tsx
```
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  User, Brain, Activity, TrendingUp, Clock, Target, Sparkles,
  BarChart3, Settings, Send, Bot, CheckCircle, Lightbulb 
} from 'lucide-react';


// ===================================================================================
// MOCK SERVICES & PLACEHOLDERS (To make the demo runnable without a backend)
// ===================================================================================


// Mock API Service
const apiService = {
  getUserProfile: async () => {
    console.log("Mock API: Fetching user profile...");
    await new Promise(res => setTimeout(res, 800)); // Simulate network delay
    return {
      user: {
        full_name: "Alex Doe",
        username: "alex_doe",
        email: "alex.doe@example.com",
        total_sessions: 12,
        total_tasks_completed: 42,
        total_consciousness_shifts: 28,
        is_premium: true,
        energy_preference: 7,
        preferred_contexts: ['Morning focused work', 'Creative expression'],
        adhd_traits: {
          hyperfocus_tendency: 8,
          creative_bursts: 9,
          energy_fluctuation: 6,
          context_switching: 5,
          stimulation_seeking: 7
        },
      },
      recent_sessions: [
        { id: 1, initial_consciousness_state: "Distracted", final_consciousness_state: "Focused", duration_minutes: 25, tasks_completed: 3, session_start: new Date().toISOString(), session_rating: 4 },
        { id: 2, initial_consciousness_state: "Overwhelmed", final_consciousness_state: "CreativeFlow", duration_minutes: 45, tasks_completed: 2, session_start: new Date(Date.now() - 86400000).toISOString(), session_rating: 5 },
      ],
      ai_usage_stats: {
        total_requests: 153,
        total_errors: 4,
        usage_counts: { openai: 80, anthropic: 50, gemini: 23 },
      }
    };
  },
  updateUserProfile: async (formData) => {
    console.log("Mock API: Updating user profile with:", formData);
    await new Promise(res => setTimeout(res, 500));
    return { success: true, user: { ...formData } };
  },
  sendChatMessage: async (payload) => {
    console.log("Mock API: Sending chat message:", payload);
    await new Promise(res => setTimeout(res, 1200));
    return {
      primary_response: `Based on your state of "Focused" and energy level of 7, here's a plan to tackle your request: "${payload.user_input}".`,
      encouragement: "You're doing great tackling this!",
      suggestions: ["Try using the Pomodoro technique.", "Remember to take a short break.", "What's the very first, smallest step?"],
      task_breakdown: { steps: ["Break down the main goal.", "Identify the first physical action.", "Set a timer for 15 minutes."] },
      consciousness_insight: "Your focused state is a superpower right now. Let's channel it effectively!",
      energy_recommendation: "Your energy is high. This is a great time for a complex task.",
      model_used: payload.preferred_ai_provider || 'openai'
    };
  }
};


// Placeholder: LoadingSpinner component
const LoadingSpinner = ({ message }) => (
  <div className="flex flex-col items-center gap-4 text-gray-500">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    <p>{message}</p>
  </div>
);


// Placeholders for components inside MainInterface
const ControlPanel = ({ session, setSession, energyLevels, setChatHistory }) => <div className="p-4 h-full bg-slate-800/50 rounded-lg"><h3 className="font-bold text-lg text-emerald-300">Control Panel</h3><p className="text-sm text-slate-400">Manage session state here.</p></div>;
const ChatPanel = ({ session, chatHistory, setChatHistory, addAchievement, onTaskComplete, energyLevels }) => <div className="p-4 h-full bg-slate-800/50 rounded-lg"><h3 className="font-bold text-lg text-emerald-300">Chat Panel</h3><p className="text-sm text-slate-400">AI interaction goes here.</p></div>;
const SessionPanel = ({ session }) => <div className="p-4 h-full bg-slate-800/50 rounded-lg"><h3 className="font-bold text-lg text-emerald-300">Session Panel</h3><p className="text-sm text-slate-400">Session stats and achievements.</p></div>;
const SessionSummaryModal = ({ session, duration, onClose, onNewSession }) => <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-slate-800 p-8 rounded-lg text-white"><h2 className="text-2xl font-bold mb-4">Session Summary</h2><p>Duration: {duration} minutes</p><div className="mt-4 flex gap-4"><button onClick={onClose} className="btn-secondary">Close</button><button onClick={onNewSession} className="btn-primary">New Session</button></div></div></div>;
const InteractiveTapestry = () => <div className="p-4 h-full bg-slate-800/50 rounded-lg flex items-center justify-center"><h3 className="font-bold text-lg text-emerald-300">Interactive Tapestry View</h3></div>;




// ===================================================================================
// COMPONENT 1: ProfileDashboard.js
// ===================================================================================


const ProfileDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    energy_preference: 5,
    preferred_contexts: [],
    adhd_traits: {}
  });


  const contextOptions = [
    'Morning focused work', 'Afternoon creative sessions', 'Evening reflection', 'High-energy tasks',
    'Quiet contemplation', 'Collaborative work', 'Solo deep work', 'Physical movement',
    'Mental challenges', 'Creative expression'
  ];


  const adhdTraitOptions = [
    { key: 'hyperfocus_tendency', label: 'Hyperfocus Tendency' },
    { key: 'creative_bursts', label: 'Creative Bursts' },
    { key: 'energy_fluctuation', label: 'Energy Fluctuation' },
    { key: 'context_switching', label: 'Context Switching Ability' },
    { key: 'stimulation_seeking', label: 'Stimulation Seeking' }
  ];


  useEffect(() => {
    loadProfile();
  }, []);


  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await apiService.getUserProfile();
      setProfile(data);
      setFormData({
        energy_preference: data.user.energy_preference || 5,
        preferred_contexts: data.user.preferred_contexts || [],
        adhd_traits: data.user.adhd_traits || {}
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };


  const handleSave = async () => {
    try {
      await apiService.updateUserProfile(formData);
      // In a real app, we'd refetch or trust the mock data. Here we'll just update local state.
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, ...formData }
      }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };
  
  const toggleContext = (context) => {
    setFormData(prev => ({
      ...prev,
      preferred_contexts: prev.preferred_contexts.includes(context)
        ? prev.preferred_contexts.filter(c => c !== context)
        : [...prev.preferred_contexts, context]
    }));
  };


  const updateTrait = (traitKey, value) => {
    setFormData(prev => ({
      ...prev,
      adhd_traits: { ...prev.adhd_traits, [traitKey]: value }
    }));
  };


  if (loading) return <div className="flex justify-center items-center h-96"><LoadingSpinner message="Loading your profile..." /></div>;
  if (!profile) return <div className="text-center py-12"><p className="text-gray-400">Failed to load profile data.</p><button onClick={loadProfile} className="mt-4 px-4 py-2 bg-blue-500 rounded">Retry</button></div>;


  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 text-gray-900">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" whileHover={{ scale: 1.05 }}><User className="w-8 h-8 text-white" /></motion.div>
            <div>
              <h1 className="text-2xl font-bold">{profile.user.full_name || 'ADHD Warrior'}</h1>
              <p className="text-gray-600">{profile.user.email}</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className={`px-4 py-2 rounded-lg transition-colors ${isEditing ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}><Settings className="w-4 h-4 inline mr-2" />{isEditing ? 'Cancel' : 'Edit Profile'}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg"><Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" /><p className="text-2xl font-bold text-blue-700">{profile.user.total_sessions}</p><p className="text-sm text-blue-600">Sessions</p></div>
          <div className="text-center p-4 bg-green-50 rounded-lg"><Target className="w-6 h-6 text-green-600 mx-auto mb-2" /><p className="text-2xl font-bold text-green-700">{profile.user.total_tasks_completed}</p><p className="text-sm text-green-600">Tasks Done</p></div>
          <div className="text-center p-4 bg-purple-50 rounded-lg"><Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" /><p className="text-2xl font-bold text-purple-700">{profile.user.total_consciousness_shifts}</p><p className="text-sm text-purple-600">State Shifts</p></div>
          <div className="text-center p-4 bg-orange-50 rounded-lg"><TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" /><p className="text-2xl font-bold text-orange-700">{profile.user.is_premium ? 'Premium' : 'Free'}</p><p className="text-sm text-orange-600">Account</p></div>
        </div>
      </div>


      {isEditing && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white rounded-xl shadow-lg p-6 overflow-hidden">
          <h2 className="text-xl font-semibold mb-4">Customize Your Profile</h2>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Energy Level: {formData.energy_preference}/10</label>
            <input type="range" min="1" max="10" value={formData.energy_preference} onChange={(e) => setFormData(prev => ({ ...prev, energy_preference: parseInt(e.target.value) }))} className="w-full" />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Contexts</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {contextOptions.map((context) => (<button key={context} onClick={() => toggleContext(context)} className={`p-2 rounded-lg text-sm transition-all ${formData.preferred_contexts.includes(context) ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'}`}>{context}</button>))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">ADHD Trait Strengths</label>
            <div className="space-y-4">
              {adhdTraitOptions.map((trait) => (
                <div key={trait.key}>
                  <div className="flex justify-between items-center mb-2"><span className="text-sm text-gray-700">{trait.label}</span><span className="text-sm font-medium">{formData.adhd_traits[trait.key] || 5}/10</span></div>
                  <input type="range" min="1" max="10" value={formData.adhd_traits[trait.key] || 5} onChange={(e) => updateTrait(trait.key, parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end space-x-3"><button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button><button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Save Changes</button></div>
        </motion.div>
      )}


      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2" /> Recent Sessions</h2>
        {profile.recent_sessions.length > 0 ? (
          <div className="space-y-3">
            {profile.recent_sessions.map((session) => (
              <div key={session.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{session.initial_consciousness_state} → {session.final_consciousness_state}</p>
                    <p className="text-sm text-gray-600">Duration: {session.duration_minutes || 0} minutes</p>
                    <p className="text-sm text-gray-600">Tasks completed: {session.tasks_completed}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(session.session_start).toLocaleDateString()}</p>
                    {session.session_rating && (<div className="flex">{Array.from({ length: 5 }, (_, i) => (<span key={i} className={`text-sm ${i < session.session_rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>))}</div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (<p className="text-gray-600 text-center py-8">No sessions yet. Start a conversation to begin tracking!</p>)}
      </div>


      {profile.ai_usage_stats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2" /> AI Usage Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(profile.ai_usage_stats.usage_counts || {}).map(([provider, count]) => (<div key={provider} className="text-center p-3 bg-gray-50 rounded-lg"><p className="font-medium capitalize">{provider}</p><p className="text-2xl font-bold text-blue-600">{count}</p><p className="text-xs text-gray-500">requests</p></div>))}
          </div>
          <div className="mt-4 text-sm text-gray-600"><p>Total Requests: {profile.ai_usage_stats.total_requests}</p><p>Total Errors: {profile.ai_usage_stats.total_errors}</p></div>
        </div>
      )}
    </motion.div>
  );
};




// ===================================================================================
// COMPONENT 2: ChatInterface.js
// ===================================================================================
const ChatInterface = ({ session, consciousnessState, energyLevel, contextClues }) => {
  const [messages, setMessages] = useState([{
    id: 1, type: 'ai', content: `Hello! I'm your consciousness-serving AI assistant. I can see you're in a ${consciousnessState} state with energy level ${energyLevel}/10. How can I support you today?`, timestamp: Date.now()
  }]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAIProvider, setSelectedAIProvider] = useState('openai');
  const messagesEndRef = useRef(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);


  const aiProviders = [
    { id: 'openai', label: 'OpenAI', icon: '🤖' }, { id: 'anthropic', label: 'Claude', icon: '🧠' },
    { id: 'gemini', label: 'Gemini', icon: '✨' }, { id: 'perplexity', label: 'Perplexity', icon: '🔍' },
    { id: 'huggingface', label: 'HuggingFace', icon: '🤗' }
  ];


  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    const userMessage = { id: Date.now(), type: 'user', content: inputValue.trim(), timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);


    try {
      const response = await apiService.sendChatMessage({
        user_input: userMessage.content, energy_level: energyLevel, context_clues: contextClues,
        session_id: session?.session_id, preferred_ai_provider: selectedAIProvider
      });
      const aiMessage = {
        id: Date.now() + 1, type: 'ai', content: response.primary_response, timestamp: Date.now(),
        encouragement: response.encouragement, suggestions: response.suggestions, taskBreakdown: response.task_breakdown,
        consciousnessInsight: response.consciousness_insight, energyRecommendation: response.energy_recommendation,
        modelUsed: response.model_used
      };
      setMessages(prev => [...prev, aiMessage]);
      if (response.encouragement) setTimeout(() => toast.success(response.encouragement), 1000);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { id: Date.now() + 1, type: 'ai', content: "I'm sorry, I encountered an error. Could you rephrase your question?", timestamp: Date.now(), isError: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } };


  const TypingIndicator = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-2 p-4">
      <Bot className="w-5 h-5 text-blue-500" />
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce " style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-600">Thinking...</span>
    </motion.div>
  );


  const TaskBreakdown = ({ tasks }) => {
    const [completedTasks, setCompletedTasks] = useState(new Set());
    const toggleTask = (index) => {
      const newCompleted = new Set(completedTasks);
      if (newCompleted.has(index)) { newCompleted.delete(index); } else { newCompleted.add(index); toast.success('Great job! 🎉'); }
      setCompletedTasks(newCompleted);
    };
    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center"><CheckCircle className="w-4 h-4 mr-2" /> Task Breakdown</h4>
        <div className="space-y-2">
          {tasks.steps?.map((step, index) => (
            <motion.div key={index} className={`flex items-center p-2 rounded-md cursor-pointer ${completedTasks.has(index) ? 'bg-green-100' : 'hover:bg-blue-100'}`} whileHover={{ scale: 1.02 }} onClick={() => toggleTask(index)}>
              <CheckCircle className={`w-5 h-5 mr-3 flex-shrink-0 ${completedTasks.has(index) ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`${completedTasks.has(index) ? 'line-through text-green-700' : 'text-gray-800'}`}>{step}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-[600px] flex flex-col text-gray-900">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}><Bot className="w-5 h-5 text-white" /></motion.div>
          <div><h3 className="font-semibold">ADHD Assistant</h3><p className="text-xs text-gray-500">Consciousness-serving AI</p></div>
        </div>
        <select value={selectedAIProvider} onChange={(e) => setSelectedAIProvider(e.target.value)} className="text-xs border rounded px-2 py-1 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400">
          {aiProviders.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
        </select>
      </div>


      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div key={message.id} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3 }} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.type === 'user' ? (<div className="bg-blue-500 text-white p-3 rounded-lg shadow-md">{message.content}</div>) : (
                  <div className="bg-gray-100 p-3 rounded-lg shadow-md">
                    <div className="flex items-start space-x-2">
                      <Bot className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="mb-2">{message.content}</p>
                        {message.taskBreakdown && <TaskBreakdown tasks={message.taskBreakdown} />}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400"><h4 className="font-medium text-yellow-800 mb-2 flex items-center"><Lightbulb className="w-4 h-4 mr-2" /> Suggestions</h4><ul className="space-y-1 list-disc list-inside text-sm text-yellow-700">{message.suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                        )}
                        {message.consciousnessInsight && (<div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400"><h4 className="font-medium text-purple-800 mb-1 flex items-center"><Sparkles className="w-4 h-4 mr-2" /> Consciousness Insight</h4><p className="text-sm text-purple-700">{message.consciousnessInsight}</p></div>)}
                        {message.modelUsed && (<div className="mt-2 text-xs text-gray-400 flex items-center"><Clock className="w-3 h-3 mr-1" /> Powered by {message.modelUsed}</div>)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>


      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Share what's on your mind..." className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="1" disabled={isLoading} />
          <motion.button onClick={handleSendMessage} disabled={!inputValue.trim() || isLoading} className={`px-4 py-2 rounded-lg transition-all ${inputValue.trim() && !isLoading ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} whileHover={{ scale: inputValue.trim() && !isLoading ? 1.05 : 1 }} whileTap={{ scale: inputValue.trim() && !isLoading ? 0.95 : 1 }}><Send className="w-4 h-4" /></motion.button>
        </div>
        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between"><span>Press Enter to send, Shift+Enter for new line</span><span>State: {consciousnessState} • Energy: {energyLevel}/10</span></div>
      </div>
    </div>
  );
};




// ===================================================================================
// COMPONENT 3: EnhancedMainInterface.tsx
// ===================================================================================


const CONSCIOUSNESS_STATES = { Hyperfocus: { key: 'Hyperfocus', color: "bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500 text-purple-300", icon: "🔥", description: "Deep focus superpowers" }, Focused: { key: 'Focused', color: "bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-emerald-500 text-emerald-300", icon: "🎯", description: "Steady, productive attention" }, Distracted: { key: 'Distracted', color: "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500 text-blue-300", icon: "🦋", description: "Butterfly mind exploring" }, Overwhelmed: { key: 'Overwhelmed', color: "bg-gradient-to-r from-slate-900/50 to-gray-900/50 border-slate-500 text-slate-300", icon: "🌊", description: "System overload detected" }, CreativeFlow: { key: 'CreativeFlow', color: "bg-gradient-to-r from-cyan-900/50 to-teal-900/50 border-cyan-500 text-cyan-300", icon: "✨", description: "Creative genius unleashed" }, EnergyCrash: { key: 'EnergyCrash', color: "bg-gradient-to-r from-indigo-900/50 to-slate-900/50 border-indigo-500 text-indigo-300", icon: "🌱", description: "Restoration time needed" } };
const ENERGY_LEVELS = [ { value: 1, label: "Deep Rest" }, { value: 5, label: "Steady" }, { value: 10, label: "Hyperfocus Fuel" } ];


const MainInterface = ({ userName, onEndSession }) => {
    const [session, setSession] = useState({ userName, consciousness: CONSCIOUSNESS_STATES.Focused, energy: 5, tasksCompleted: 0, consciousnessShifts: 0, sessionStart: new Date() });
    const [sessionDuration, setSessionDuration] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [view, setView] = useState('coach');
    const [isEmbersActive, setIsEmbersActive] = useState(false);


    useEffect(() => {
        const timer = setInterval(() => setSessionDuration(Math.floor((new Date().getTime() - session.sessionStart.getTime()) / 60000)), 1000);
        return () => clearInterval(timer);
    }, [session.sessionStart]);


    return (
        <div className="flex flex-col h-[calc(100vh-100px)] text-white relative overflow-hidden bg-slate-900/30 rounded-lg">
            <header className="flex justify-between items-center p-4 bg-slate-900/50 backdrop-blur-md border-b border-emerald-500/20 shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <span className="text-lg text-emerald-300">Hello, {userName}!</span>
                </div>
                <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg">
                    <button onClick={() => setView('coach')} className={`px-4 py-1.5 text-sm rounded-md ${view === 'coach' ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900' : 'text-emerald-300 hover:bg-slate-700/50'}`}>Coach</button>
                    <button onClick={() => setView('tapestry')} className={`px-4 py-1.5 text-sm rounded-md ${view === 'tapestry' ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900' : 'text-emerald-300 hover:bg-slate-700/50'}`}>Tapestry</button>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm ${session.consciousness.color}`}><span>{session.consciousness.icon}</span><span className="hidden md:inline">{session.consciousness.description}</span></div>
                    <button onClick={() => setShowSummary(true)} className="px-4 py-2 text-sm bg-slate-700/50 text-emerald-300 rounded-md hover:bg-slate-600/50">End Session</button>
                </div>
            </header>


            <main className={`flex-grow p-4 grid gap-4 overflow-hidden ${view === 'coach' ? 'grid-cols-1 lg:grid-cols-[300px_1fr_300px]' : 'grid-cols-1'}`}>
                {view === 'coach' ? (<>
                    <ControlPanel session={session} setSession={setSession} energyLevels={ENERGY_LEVELS} setChatHistory={()=>{}} />
                    <ChatPanel session={session} chatHistory={[]} setChatHistory={()=>{}} addAchievement={()=>{}} onTaskComplete={()=>{}} energyLevels={ENERGY_LEVELS} />
                    <SessionPanel session={session} />
                </>) : (
                    <InteractiveTapestry />
                )}
            </main>
            
            {showSummary && <SessionSummaryModal session={session} duration={sessionDuration} onClose={() => setShowSummary(false)} onNewSession={onEndSession} />}
        </div>
    );
};




// ===================================================================================
// COMPONENT 4: Welcome.tsx
// ===================================================================================


const Welcome = ({ onStartSession }) => {
  const [name, setName] = useState('');
  const handleStart = () => { if (name.trim()) onStartSession(name.trim()); else toast.error('Please enter your name!'); };
  const handleKeyPress = (e) => { if (e.key === 'Enter') handleStart(); };


  useEffect(() => {
    // This is a simplified embers effect. In a real app, you might manage this more robustly.
    const interval = setInterval(() => {
        const container = document.getElementById('welcome-ember-container');
        if (container) {
            const ember = document.createElement('div');
            ember.className = 'floating-ember';
            const size = Math.random() * 6 + 3;
            ember.style.width = `${size}px`;
            ember.style.height = `${size}px`;
            ember.style.left = `${Math.random() * 100}%`;
            ember.style.animationDuration = `${Math.random() * 8 + 6}s`;
            container.appendChild(ember);
            setTimeout(() => ember.remove(), 14000);
        }
    }, 200);
    return () => clearInterval(interval);
  }, []);


  const LogoIcon = () => (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto text-cyan-400 animate-pulse"><path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2V22" stroke="currentColor" strokeWidth="1.5" /><path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" /></svg>
  );


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden bg-slate-900">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 -z-20" />
      <div id="welcome-ember-container" className="fixed inset-0 -z-10 pointer-events-none" />
      <div className="w-full max-w-xl text-center z-10">
        <div className="mb-8">
          <LogoIcon />
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-4 mb-4">🧠 GestaltView</h1>
          <p className="text-xl text-emerald-300">The first consciousness-serving AI platform designed FOR ADHD brains</p>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-slate-900/30 backdrop-blur-lg rounded-xl border border-emerald-500/20 shadow-lg p-8">
          <h2 className="text-3xl font-semibold text-teal-300 mb-2">Welcome!</h2>
          <p className="text-lg text-slate-400 mb-6">We work <span className="text-emerald-400 font-semibold">WITH</span> your brain, not against it.</p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} onKeyPress={handleKeyPress} className="w-full px-4 py-3 text-lg text-center bg-slate-800/50 border border-emerald-500/30 rounded-md text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400 outline-none" placeholder="Enter your name" />
            <button onClick={handleStart} disabled={!name.trim()} className="w-full sm:w-auto px-8 py-3 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900 rounded-md hover:opacity-90 disabled:opacity-50 transition-all shadow-lg transform hover:scale-105">Start Session</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};




// ===================================================================================
// THE MAIN APP ORCHESTRATOR
// ===================================================================================


const App = () => {
  const [userName, setUserName] = useState('');
  const [view, setView] = useState('main'); // 'main' | 'profile' | 'chat'


  const handleStartSession = (name) => {
    setUserName(name);
    toast.success(`Welcome, ${name}! Your session has started.`);
  };


  const handleEndSession = () => {
    toast.success('Session ended. Thanks for using GestaltView!');
    setUserName('');
    setView('main');
  };


  if (!userName) {
    return (
      <>
        <Toaster position="top-right" />
        <Welcome onStartSession={handleStartSession} />
        {/* We need a style tag for the ember animation */}
        <style>{`
          @keyframes float-up {
            0% { transform: translateY(0); opacity: 1; }
            100% { transform: translateY(-110vh); opacity: 0; }
          }
          .floating-ember {
            position: absolute;
            bottom: -20px;
            border-radius: 50%;
            pointer-events: none;
            animation: float-up 14s linear infinite;
            background-color: #10B981; /* Default color */
          }
        `}</style>
      </>
    );
  }


  const navButtonClass = (buttonView) => 
    `px-4 py-2 rounded transition-colors ${view === buttonView ? 'bg-emerald-500 text-white' : 'bg-slate-700/50 hover:bg-slate-600/50'}`;


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white font-sans">
      <Toaster position="top-right" />
      <header className="flex justify-between items-center p-4 bg-slate-900/50 backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🧠 GestaltView ({userName})
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setView('main')} className={navButtonClass('main')}>Main</button>
          <button onClick={() => setView('profile')} className={navButtonClass('profile')}>Profile</button>
          <button onClick={() => setView('chat')} className={navButtonClass('chat')}>Chat</button>
          <button onClick={handleEndSession} className="px-4 py-2 bg-red-500/80 rounded hover:bg-red-600/80">End Session</button>
        </div>
      </header>
      <main className="p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            {view === 'main' && <MainInterface userName={userName} onEndSession={handleEndSession} />}
            {view === 'profile' && <ProfileDashboard />}
            {view === 'chat' && <ChatInterface session={{id: 'demo-session'}} consciousnessState="Focused" energyLevel={7} contextClues={['working on project']} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};


export default App;
```


    ```
    # .env file
    REACT_APP_HUGGING_FACE_API_KEY=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
    ```


3.  If your development server is running, **stop it and restart it**. This is necessary for the `.env` file to be loaded.


---


### The Updated `apiService` with Real Hugging Face API Calls


Now, let's replace the mock `apiService` in your `App.tsx` file. I've chosen a powerful, free-to-use model (`mistralai/Mistral-7B-Instruct-v0.2`) that is excellent at following instructions.


Copy and paste this entire `apiService` block to replace the old mock one in your `App.tsx` file.


```tsx
// ===================================================================================
// REAL API SERVICE (Using Hugging Face)
// ===================================================================================


const apiService = {
  // We'll keep these two as mocks for the demo to keep it simple
  getUserProfile: async () => { /* ... existing mock code ... */ },
  updateUserProfile: async (formData) => { /* ... existing mock code ... */ },


  // This is the function we are replacing with a real API call
  sendChatMessage: async (payload) => {
    console.log("Real HF API: Sending chat message:", payload);
    const API_KEY = import.meta.env.REACT_APP_HUGGING_FACE_API_KEY;
    const MODEL_ID = "mistralai/Mistral-7B-Instruct-v0.2";
    
    // 1. Prompt Engineering: We'll instruct the model how to behave.
    // This is where the magic happens! We're telling the AI its persona and context.
    const systemPrompt = `You are GestaltView, a consciousness-serving AI assistant designed for users with ADHD.
Your user is currently in a "${payload.consciousnessState}" state with an energy level of ${payload.energyLevel}/10.
Your goal is to be empathetic, supportive, and provide actionable, broken-down advice.
ALWAYS respond with a JSON object in the following format, and nothing else:
{
  "primary_response": "Your main helpful and empathetic message to the user.",
  "encouragement": "A short, uplifting phrase like 'You've got this!' or 'Great question!'.",
  "suggestions": ["A short list of 2-3 actionable next steps or alternative ideas."],
  "task_breakdown": { "steps": ["If the user asked for a plan, provide a simple, 3-step breakdown here. Otherwise, this can be an empty array."] },
  "consciousness_insight": "A brief insight connecting your advice to their current consciousness state.",
  "energy_recommendation": "A brief suggestion related to their energy level."
}
`;
    
    const userPrompt = `User's message: "${payload.user_input}"`;
    
    const finalPrompt = `[INST] ${systemPrompt} \n\n ${userPrompt} [/INST]`;


    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${MODEL_ID}`,
        {
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ 
            inputs: finalPrompt,
            parameters: {
              max_new_tokens: 500, // Controls the length of the response
              temperature: 0.7,     // Controls the creativity of the response
              return_full_text: false, // We only want the generated part
            }
          }),
        }
      );


      if (!response.ok) {
        const errorBody = await response.json();
        // A common HF error is the model loading. We can handle it gracefully.
        if (response.status === 503) {
          console.warn("Model is loading, please wait and try again.");
          toast.error("The AI model is warming up. Please try sending your message again in a moment.");
          throw new Error("Model is loading");
        }
        console.error("Hugging Face API Error:", errorBody);
        throw new Error(`API Error: ${errorBody.error}`);
      }
      
      const result = await response.json();
      const generatedText = result[0].generated_text;
      
      // 2. Parse the AI's JSON response
      // Sometimes the model might not return perfect JSON, so we wrap this in a try-catch
      try {
        const parsedResponse = JSON.parse(generatedText);
        
        return {
          ...parsedResponse,
          modelUsed: 'Mistral-7B' // Add the model name for the UI
        };
      } catch (parseError) {
        console.error("Failed to parse JSON from model response:", generatedText);
        // Fallback for when the model doesn't return perfect JSON
        return {
          primary_response: generatedText, // Show the raw text if parsing fails
          encouragement: "Let's keep going!",
          suggestions: [],
          task_breakdown: { steps: [] },
          consciousness_insight: "Sometimes the AI gets creative with its formatting!",
          energy_recommendation: "A great time to take a deep breath.",
          modelUsed: 'Mistral-7B'
        };
      }


    } catch (error) {
      console.error("Chat API call failed:", error);
      // Return an error object that the UI can still render
      return {
        primary_response: "I'm sorry, I'm having a little trouble connecting right now. Please try again in a moment.",
        isError: true,
        modelUsed: 'Error'
      };
    }
  }
};

```

## frontend/src/GlassCard.js
```
// src/GlassCard.js
import React from 'react';
import './GlassCard.css'; // Import the component-specific stylesheet

function GlassCard({ children }) {
  return (
    <div className="component-container">
      <div className="component">
        {children}
      </div>
    </div>
  );
}

export default GlassCard;

```

## frontend/src/services/api.js
```
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('clerk-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'Something went wrong';

    // Only show toast for non-auth errors
    if (error.response?.status !== 401) {
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  async healthCheck() {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Initialize session
  async initializeSession(data) {
    try {
      const response = await api.post('/initialize', data);
      return response.data;
    } catch (error) {
      console.error('Session initialization failed:', error);
      throw error;
    }
  },

  // Chat interaction
  async sendChatMessage(data) {
    try {
      const response = await api.post('/chat', data);
      return response.data;
    } catch (error) {
      console.error('Chat request failed:', error);
      throw error;
    }
  },

  // Update consciousness state
  async updateConsciousnessState(data) {
    try {
      const response = await api.post('/consciousness/update', data);
      return response.data;
    } catch (error) {
      console.error('Consciousness state update failed:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to get user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(data) {
    try {
      const response = await api.patch('/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  },

  // Submit session feedback
  async submitSessionFeedback(sessionId, feedback) {
    try {
      const response = await api.post(`/session/${sessionId}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error('Failed to submit session feedback:', error);
      throw error;
    }
  },

  // Get AI usage statistics (for authenticated users)
  async getAIStats() {
    try {
      const response = await api.get('/admin/ai-stats');
      return response.data;
    } catch (error) {
      console.error('Failed to get AI stats:', error);
      throw error;
    }
  }
};

// Helper function to set auth token
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('clerk-token', token);
  } else {
    localStorage.removeItem('clerk-token');
  }
};

export default apiService;

```

## frontend/src/components/EnhancedWelcome.tsx
```
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Bot, Brain, Sparkles } from 'lucide-react';

// WelcomeScreen (from your code, enhanced)
const WelcomeScreen = ({ onStartSession }) => {
  const [name, setName] = useState('');
  const handleStart = () => {
    if (name.trim()) onStartSession(name.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
        <h1 className="text-4xl font-bold text-cyan-400 mb-4">GestaltView Testing Interface</h1>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
          className="px-4 py-2 rounded touch-target"
        />
        <button onClick={handleStart} className="mt-4 px-6 py-2 bg-emerald-500 rounded touch-target">Start Testing</button>
      </motion.div>
    </div>
  );
};

// Testing Dashboard
const TestingDashboard = ({ session }) => {
  const [testResult, setTestResult] = useState(null);

  const runTest = async () => {
    try {
      const response = await axios.post('http://localhost:8000/ml/integrate', { image_path: 'test.jpg', musical_sequence: [1, 2, 3] });
      setTestResult(response.data);
      toast.success('Test successful!');
    } catch (error) {
      toast.error('Test failed!');
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded">
      <h2 className="text-xl text-cyan-400">ML Integration Test</h2>
      <button onClick={runTest} className="mt-2 px-4 py-2 bg-purple-500 rounded">Run CNN/RNN Test</button>
      {testResult && <pre className="mt-4 text-white">{JSON.stringify(testResult, null, 2)}</pre>}
    </div>
  );
};

// Main App
const App = () => {
  const [userName, setUserName] = useState('');

  if (!userName) return <WelcomeScreen onStartSession={setUserName} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl text-cyan-400">GestaltView Test ({userName})</h1>
        <div className="flex gap-2">
          <Bot className="text-emerald-400" />
          <Brain className="text-purple-400" />
          <Sparkles className="text-pink-400" />
        </div>
      </header>
      <TestingDashboard session={{}} />
      {/* Integrate your ChatInterface, ConsciousnessTracker here for full testing */}
    </div>
  );
);

    // Neural Aurora Embers Animation
    const emberColors = ["#10B981", "#06B6D4", "#34D399", "#6EE7B7", "#A78BFA", "#F472B6", "#FBBF24"];
    
    const createEmber = useCallback(() => {
        const ember = document.createElement('div');
        ember.className = 'floating-ember';
        
        const size = Math.random() * 6 + 3; // 3px to 9px
        const speed = Math.random() * 8 + 6; // 6s to 14s duration
        
        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.left = `${Math.random() * 100}%`;
        ember.style.opacity = `${Math.random() * 0.7 + 0.3}`; // 0.3 to 1.0
        ember.style.backgroundColor = emberColors[Math.floor(Math.random() * emberColors.length)];
        ember.style.animationDuration = `${speed}s`;
        ember.style.position = 'absolute';
        ember.style.bottom = '-20px';
        ember.style.borderRadius = '50%';
        ember.style.pointerEvents = 'none';
        ember.style.animation = 'float-up 10s linear infinite';
        ember.style.zIndex = '-1';
        
        const container = document.getElementById('welcome-ember-container');
        if (container) {
            container.appendChild(ember);
            
            // Remove ember from DOM after animation completes
            setTimeout(() => {
                ember.remove();
            }, speed * 1000);
        }
    }, [emberColors]);

    const startEmbers = useCallback(() => {
        if (isEmbersActive) return;
        setIsEmbersActive(true);
        
        const interval = setInterval(createEmber, 200);
        setEmberInterval(interval);
    }, [isEmbersActive, createEmber]);

    const stopEmbers = useCallback(() => {
        if (!isEmbersActive) return;
        setIsEmbersActive(false);
        
        if (emberInterval) {
            clearInterval(emberInterval);
            setEmberInterval(null);
        }
        
        // Fade out existing embers
        const container = document.getElementById('welcome-ember-container');
        if (container) {
            Array.from(container.children).forEach(ember => {
                (ember as HTMLElement).style.transition = 'opacity 0.5s ease';
                (ember as HTMLElement).style.opacity = '0';
                setTimeout(() => ember.remove(), 500);
            });
        }
    }, [isEmbersActive, emberInterval]);

    const toggleEmbers = useCallback(() => {
        if (isEmbersActive) {
            stopEmbers();
        } else {
            startEmbers();
        }
    }, [isEmbersActive, startEmbers, stopEmbers]);

    // Auto-start embers after 2 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            startEmbers();
        }, 2000);
        
        return () => clearTimeout(timer);
    }, [startEmbers]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (emberInterval) {
                clearInterval(emberInterval);
            }
        };
    }, [emberInterval]);

    const LogoIcon = () => (
        <svg 
            width="80" 
            height="80" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg" 
            className="mx-auto text-cyan-400 animate-pulse"
        >
            <path 
                d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M12 2V22" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M12 2C14.7614 2 17 6.47715 17 12C17 17.5228 14.7614 22 12 22" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
            <path 
                d="M12 2C9.23858 2 7 6.47715 7 12C7 17.5228 9.23858 22 12 22" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
            {/* Keith's Neural Aurora Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 -z-30" />
            <div className="fixed inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -z-20 animate-pulse" />
            <div className="fixed inset-0 opacity-30 -z-10">
                <div className="absolute inset-0 bg-radial-gradient(circle_at_20%_30%,_theme(colors.teal.400),_transparent_50%),_radial-gradient(circle_at_40%_70%,_theme(colors.emerald.400),_transparent_50%),_radial-gradient(circle_at_80%_10%,_theme(colors.purple.400),_transparent_50%) animate-pulse" />
            </div>
            
            {/* Floating Embers Container */}
            <div id="welcome-ember-container" className="fixed inset-0 -z-10 pointer-events-none" />

            {/* Controls */}
            <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={toggleEmbers}
                    className="component px-4 py-2 text-sm font-semibold text-emerald-300 rounded-md hover:bg-slate-600/50 hover:text-white transition touch-target"
                >
                    {isEmbersActive ? 'Disable Embers' : 'Enable Embers'}
                </button>
            </div>

            <div className="w-full max-w-xl text-center relative z-1">
                {/* Logo and Title */}
                <div className="mb-8">
                    <LogoIcon />
                    <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight mt-4 mb-4">
                        🧠 GestaltView
                    </h1>
                    <p className="text-xl sm:text-2xl text-emerald-300 leading-relaxed">
                        The first consciousness-serving AI platform designed FOR ADHD brains
                    </p>
                </div>

                {/* Welcome Card */}
                <div className="component bg-gradient-to-br from-emerald-950/20 to-slate-900/30 backdrop-blur-lg rounded-xl border border-emerald-500/20 shadow-lg p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-semibold text-teal-300 mb-2">Welcome!</h2>
                        <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                            GestaltView is your AI partner built to support your unique ADHD consciousness. 
                            We work <span className="text-emerald-400 font-semibold">WITH</span> your brain, not against it.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input
                            type="text"
                            id="user-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full px-4 py-3 text-lg text-center bg-slate-800/50 border border-emerald-500/30 rounded-md text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-400/50 focus:border-transparent outline-none transition touch-target"
                            placeholder="Enter your name"
                        />
                        <button
                            onClick={handleStart}
                            disabled={!name.trim()}
                            className="w-full sm:w-auto px-8 py-3 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900 rounded-md hover:from-emerald-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform hover:scale-105 touch-target"
                        >
                            Start Session
                        </button>
                    </div>

                    <div className="mt-4 text-sm text-slate-500 text-center">
                        Your journey to understanding your beautiful, complex mind begins here
                    </div>
                </div>

                {/* Features Preview */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="component text-center p-4">
                        <div className="text-2xl mb-2">🧠</div>
                        <div className="text-teal-300 font-semibold">Personal Language Key</div>
                        <div className="text-slate-400">AI that speaks YOUR language</div>
                    </div>
                    <div className="component text-center p-4">
                        <div className="text-2xl mb-2">⚡</div>
                        <div className="text-teal-300 font-semibold">Bucket Drops</div>
                        <div className="text-slate-400">Capture lightning-bolt insights</div>
                    </div>
                    <div className="component text-center p-4">
                        <div className="text-2xl mb-2">🎵</div>
                        <div className="text-teal-300 font-semibold">Musical DNA</div>
                        <div className="text-slate-400">Your emotional architecture</div>
                    </div>
                </div>
            </div>

            {/* CSS for animations and Keith's Theme */}
            <style jsx>{`
                @keyframes float-up {
                    0% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-110vh);
                        opacity: 0;
                    }
                }
                
                .floating-ember {
                    position: absolute;
                    bottom: -20px;
                    border-radius: 50%;
                    pointer-events: none;
                    animation: float-up 10s linear infinite;
                    z-index: -1;
                }

                .component {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    transition: all 0.3s ease;
                }

                .component:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 6px 35px rgba(0, 0, 0, 0.2);
                }

                .touch-target {
                    min-height: 44px;
                    min-width: 44px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }

                .touch-target:active {
                    transform: scale(0.95);
                }

                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                }

                .aurora-text {
                    background: linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899);
                    -webkit-background-clip: text;
                    background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
            `}</style>
        </div>
    );
 );   
       export default app.tsx

```

## frontend/src/components/Neural-aurora-demo.js
```
export default App;

document.addEventListener('DOMContentLoaded', () => {
  // DOM Element Selectors
  const htmlElement = document.documentElement;
  const bodyElement = document.body;
  const emberContainer = document.getElementById('ember-container');
  const darkModeBtn = document.getElementById('toggle-dark-mode');
  const embersBtn = document.getElementById('toggle-embers');
  const overwhelmBtn = document.getElementById('toggle-overwhelm');

  // State Management
  let isEmbersActive = false;
  let emberInterval = null;

  // Dark Mode Toggle
  const toggleDarkMode = () => {
    htmlElement.classList.toggle('dark');
    const isDark = htmlElement.classList.contains('dark');
    darkModeBtn.textContent = isDark ? 'Enable Light Mode' : 'Enable Dark Mode';
  };

  darkModeBtn.addEventListener('click', toggleDarkMode);

  // Overwhelm Mode Toggle
  const toggleOverwhelmMode = () => {
    bodyElement.classList.toggle('overwhelm-mode');
    const isOverwhelmed = bodyElement.classList.contains('overwhelm-mode');
    overwhelmBtn.textContent = isOverwhelmed ? 'Disable Overwhelm Mode' : 'Enable Overwhelm Mode';
  };

  overwhelmBtn.addEventListener('click', toggleOverwhelmMode);

  // Floating Embers Logic
  const emberColors = ["#10B981", "#06B6D4", "#34D399", "#6EE7B7"];

  const createEmber = () => {
    const ember = document.createElement('div');
    ember.className = 'floating-ember';

    const size = Math.random() * 6 + 3; // 3px to 9px
    const speed = Math.random() * 8 + 6; // 6s to 14s duration

    ember.style.width = `${size}px`;
    ember.style.height = `${size}px`;
    ember.style.left = `${Math.random() * 100}%`;
    ember.style.opacity = Math.random() * 0.7 + 0.3; // 0.3 to 1.0
    ember.style.backgroundColor = emberColors[Math.floor(Math.random() * emberColors.length)];
    ember.style.animationDuration = `${speed}s`;

    emberContainer.appendChild(ember);

    // Remove ember from DOM after animation completes to prevent buildup
    setTimeout(() => {
      ember.remove();
    }, speed * 1000);
  };

  const startEmbers = () => {
    if (isEmbersActive) return;
    isEmbersActive = true;
    embersBtn.textContent = 'Deactivate Embers';

    // Start a continuous stream of embers
    emberInterval = setInterval(createEmber, 200);
  };

  const stopEmbers = () => {
    if (!isEmbersActive) return;
    isEmbersActive = false;
    embersBtn.textContent = 'Activate Embers';

    clearInterval(emberInterval);

    // Optional: fade out existing embers for a smoother stop
    Array.from(emberContainer.children).forEach(ember => {
      ember.style.transition = 'opacity 0.5s ease';
      ember.style.opacity = 0;
      setTimeout(() => ember.remove(), 500);
    });
  };

  embersBtn.addEventListener('click', () => {
    if (isEmbersActive) {
      stopEmbers();
    } else {
      startEmbers();
    }
  });
});

```

## frontend/src/components/ChatInterface.js
```
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, CheckCircle, Clock, Lightbulb } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const ChatInterface = ({ session, consciousnessState, energyLevel, contextClues }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello! I'm your consciousness-serving AI assistant. I can see you're in a ${consciousnessState} state with energy level ${energyLevel}/10. How can I support you today?`,
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAIProvider, setSelectedAIProvider] = useState('openai');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const aiProviders = [
    { id: 'openai', label: 'OpenAI', icon: '🤖' },
    { id: 'anthropic', label: 'Claude', icon: '🧠' },
    { id: 'gemini', label: 'Gemini', icon: '✨' },
    { id: 'perplexity', label: 'Perplexity', icon: '🔍' },
    { id: 'huggingface', label: 'HuggingFace', icon: '🤗' }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await apiService.sendChatMessage({
        user_input: userMessage.content,
        energy_level: energyLevel,
        context_clues: contextClues,
        session_id: session?.session_id,
        preferred_ai_provider: selectedAIProvider
      });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.primary_response,
        timestamp: Date.now(),
        encouragement: response.encouragement,
        suggestions: response.suggestions,
        taskBreakdown: response.task_breakdown,
        consciousnessInsight: response.consciousness_insight,
        energyRecommendation: response.energy_recommendation,
        modelUsed: response.model_used
      };

      setMessages(prev => [...prev, aiMessage]);

      // Show encouragement as toast
      if (response.encouragement) {
        setTimeout(() => {
          toast.success(response.encouragement);
        }, 1000);
      }

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I encountered an error. Let me try to help you in a different way. Could you rephrase your question?",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const TypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg max-w-md"
    >
      <Bot className="w-5 h-5 text-blue-500" />
      <div className="typing-indicator">
        <div className="typing-dot" style={{ '--delay': '0ms' }}></div>
        <div className="typing-dot" style={{ '--delay': '150ms' }}></div>
        <div className="typing-dot" style={{ '--delay': '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-600">Thinking...</span>
    </motion.div>
  );

  const TaskBreakdown = ({ tasks }) => {
    const [completedTasks, setCompletedTasks] = useState(new Set());

    const toggleTask = (index) => {
      const newCompleted = new Set(completedTasks);
      if (newCompleted.has(index)) {
        newCompleted.delete(index);
      } else {
        newCompleted.add(index);
        toast.success('Great job! 🎉');
      }
      setCompletedTasks(newCompleted);
    };

    return (
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          Task Breakdown
        </h4>
        <div className="space-y-2">
          {tasks.steps?.map((step, index) => (
            <motion.div
              key={index}
              className={`task-step ${completedTasks.has(index) ? 'completed' : ''}`}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleTask(index)}
            >
              <CheckCircle className={`w-4 h-4 mr-3 ${
                completedTasks.has(index) ? 'text-green-600' : 'text-gray-400'
              }`} />
              <span className={`${
                completedTasks.has(index) ? 'line-through text-green-700' : ''
              }`}>
                {step}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 h-96 md:h-[500px] flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Bot className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-gray-900">ADHD Assistant</h3>
            <p className="text-xs text-gray-500">Consciousness-serving AI</p>
          </div>
        </div>

        {/* AI Provider Selector */}
        <select
          value={selectedAIProvider}
          onChange={(e) => setSelectedAIProvider(e.target.value)}
          className="text-xs border rounded px-2 py-1 bg-gray-50"
        >
          {aiProviders.map(provider => (
            <option key={provider.id} value={provider.id}>
              {provider.icon} {provider.label}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                {message.type === 'user' ? (
                  <div className="message-user">
                    {message.content}
                  </div>
                ) : (
                  <div className="message-ai">
                    <div className="flex items-start space-x-2">
                      {message.type === 'ai' && (
                        <Bot className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="mb-2">{message.content}</p>

                        {/* Task Breakdown */}
                        {message.taskBreakdown && (
                          <TaskBreakdown tasks={message.taskBreakdown} />
                        )}

                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                            <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
                              <Lightbulb className="w-4 h-4 mr-2" />
                              Suggestions
                            </h4>
                            <ul className="space-y-1">
                              {message.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-sm text-yellow-700 flex items-start">
                                  <span className="mr-2">•</span>
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Consciousness Insight */}
                        {message.consciousnessInsight && (
                          <div className="mt-3 p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                            <h4 className="font-medium text-purple-800 mb-1 flex items-center">
                              <Sparkles className="w-4 h-4 mr-2" />
                              Consciousness Insight
                            </h4>
                            <p className="text-sm text-purple-700">{message.consciousnessInsight}</p>
                          </div>
                        )}

                        {/* Energy Recommendation */}
                        {message.energyRecommendation && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <h4 className="font-medium text-green-800 mb-1">Energy Advice</h4>
                            <p className="text-sm text-green-700">{message.energyRecommendation}</p>
                          </div>
                        )}

                        {/* Model used indicator */}
                        {message.modelUsed && (
                          <div className="mt-2 text-xs text-gray-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Powered by {message.modelUsed}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex space-x-2">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="1"
            disabled={isLoading}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className={`px-4 py-2 rounded-lg transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            whileHover={{ scale: inputValue.trim() && !isLoading ? 1.05 : 1 }}
            whileTap={{ scale: inputValue.trim() && !isLoading ? 0.95 : 1 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="mt-2 text-xs text-gray-500 flex items-center justify-between">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span>State: {consciousnessState} • Energy: {energyLevel}/10</span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

```

## frontend/src/components/index.js
```
export { default as Header } from './Header';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ConsciousnessTracker } from './ConsciousnessTracker';
export { default as ChatInterface } from './ChatInterface';
export { default as ProfileDashboard } from './ProfileDashboard';

```

## frontend/src/components/Header.js
```
import React from 'react';
import { useAuth, UserButton, SignInButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, User, Settings, Zap } from 'lucide-react';

const Header = ({ userName, isAuthenticated, consciousnessState, energyLevel }) => {
  const { isSignedIn } = useAuth();

  const getStateColor = (state) => {
    const colors = {
      hyperfocus: 'text-purple-600',
      overwhelmed: 'text-red-600',
      distracted: 'text-orange-600',
      focused: 'text-green-600',
      creative_flow: 'text-pink-600',
      energy_crash: 'text-gray-600'
    };
    return colors[state] || 'text-blue-600';
  };

  const getEnergyIndicators = (level) => {
    return Array.from({ length: 10 }, (_, i) => (
      <span
        key={i}
        className={`inline-block w-1 h-4 mx-0.5 rounded ${
          i < level 
            ? level <= 3 
              ? 'bg-red-400' 
              : level <= 6 
                ? 'bg-yellow-400' 
                : 'bg-green-400'
            : 'bg-gray-200'
        }`}
      />
    ));
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 10 }}
              className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
            >
              <Brain className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                GestaltView
              </h1>
              <p className="text-xs text-gray-500">Consciousness-Serving AI</p>
            </div>
          </Link>

          {/* Consciousness Status (center) */}
          {isAuthenticated && (
            <motion.div 
              className="hidden md:flex items-center space-x-6 px-4 py-2 bg-gray-50 rounded-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">State:</span>
                <span className={`font-medium capitalize ${getStateColor(consciousnessState)}`}>
                  {consciousnessState.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Energy:</span>
                <div className="flex items-center">
                  {getEnergyIndicators(energyLevel)}
                </div>
                <span className="text-sm font-medium">{energyLevel}/10</span>
              </div>
            </motion.div>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </Link>

                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="btn-dopamine">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Mobile consciousness status */}
        {isAuthenticated && (
          <motion.div 
            className="md:hidden mt-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">State:</span>
              <span className={`font-medium capitalize ${getStateColor(consciousnessState)}`}>
                {consciousnessState.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <div className="flex items-center">
                {getEnergyIndicators(energyLevel)}
              </div>
              <span className="text-sm font-medium">{energyLevel}/10</span>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header;

```

## frontend/src/components/ProfileDashboard.js
```
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Brain, 
  Activity, 
  TrendingUp, 
  Clock, 
  Target, 
  Sparkles,
  BarChart3,
  Settings
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

const ProfileDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    energy_preference: 5,
    preferred_contexts: [],
    adhd_traits: {}
  });

  const contextOptions = [
    'Morning focused work',
    'Afternoon creative sessions',
    'Evening reflection',
    'High-energy tasks',
    'Quiet contemplation',
    'Collaborative work',
    'Solo deep work',
    'Physical movement',
    'Mental challenges',
    'Creative expression'
  ];

  const adhdTraitOptions = [
    { key: 'hyperfocus_tendency', label: 'Hyperfocus Tendency', type: 'scale' },
    { key: 'creative_bursts', label: 'Creative Bursts', type: 'scale' },
    { key: 'energy_fluctuation', label: 'Energy Fluctuation', type: 'scale' },
    { key: 'context_switching', label: 'Context Switching Ability', type: 'scale' },
    { key: 'stimulation_seeking', label: 'Stimulation Seeking', type: 'scale' }
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await apiService.getUserProfile();
      setProfile(data);
      setFormData({
        energy_preference: data.user.energy_preference || 5,
        preferred_contexts: data.user.preferred_contexts || [],
        adhd_traits: data.user.adhd_traits || {}
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiService.updateUserProfile(formData);
      setProfile(prev => ({
        ...prev,
        user: {
          ...prev.user,
          ...formData
        }
      }));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const toggleContext = (context) => {
    setFormData(prev => ({
      ...prev,
      preferred_contexts: prev.preferred_contexts.includes(context)
        ? prev.preferred_contexts.filter(c => c !== context)
        : [...prev.preferred_contexts, context]
    }));
  };

  const updateTrait = (traitKey, value) => {
    setFormData(prev => ({
      ...prev,
      adhd_traits: {
        ...prev.adhd_traits,
        [traitKey]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner message="Loading your profile..." />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load profile data.</p>
        <button onClick={loadProfile} className="btn-dopamine mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile.user.full_name || profile.user.username || 'ADHD Warrior'}
              </h1>
              <p className="text-gray-600">{profile.user.email}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isEditing 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-blue-700">{profile.user.total_sessions}</p>
            <p className="text-sm text-blue-600">Sessions</p>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Target className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-700">{profile.user.total_tasks_completed}</p>
            <p className="text-sm text-green-600">Tasks Done</p>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-purple-700">{profile.user.total_consciousness_shifts}</p>
            <p className="text-sm text-purple-600">State Shifts</p>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-700">
              {profile.user.is_premium ? 'Premium' : 'Free'}
            </p>
            <p className="text-sm text-orange-600">Account</p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Customize Your Profile</h2>

          {/* Energy Preference */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Energy Level: {formData.energy_preference}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={formData.energy_preference}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                energy_preference: parseInt(e.target.value)
              }))}
              className="w-full"
            />
          </div>

          {/* Preferred Contexts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Contexts
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {contextOptions.map((context) => (
                <button
                  key={context}
                  onClick={() => toggleContext(context)}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    formData.preferred_contexts.includes(context)
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                  }`}
                >
                  {context}
                </button>
              ))}
            </div>
          </div>

          {/* ADHD Traits */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              ADHD Trait Strengths
            </label>
            <div className="space-y-4">
              {adhdTraitOptions.map((trait) => (
                <div key={trait.key}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-700">{trait.label}</span>
                    <span className="text-sm font-medium">
                      {formData.adhd_traits[trait.key] || 5}/10
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.adhd_traits[trait.key] || 5}
                    onChange={(e) => updateTrait(trait.key, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-dopamine"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      )}

      {/* Recent Sessions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Recent Sessions
        </h2>

        {profile.recent_sessions.length > 0 ? (
          <div className="space-y-3">
            {profile.recent_sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {session.initial_consciousness_state} → {session.final_consciousness_state}
                    </p>
                    <p className="text-sm text-gray-600">
                      Duration: {session.duration_minutes || 0} minutes
                    </p>
                    <p className="text-sm text-gray-600">
                      Tasks completed: {session.tasks_completed}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(session.session_start).toLocaleDateString()}
                    </p>
                    {session.session_rating && (
                      <div className="flex">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`text-sm ${
                              i < session.session_rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">
            No sessions yet. Start a conversation to begin tracking!
          </p>
        )}
      </div>

      {/* AI Usage Stats */}
      {profile.ai_usage_stats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            AI Usage Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(profile.ai_usage_stats.usage_counts || {}).map(([provider, count]) => (
              <div key={provider} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="font-medium capitalize">{provider}</p>
                <p className="text-2xl font-bold text-blue-600">{count}</p>
                <p className="text-xs text-gray-500">requests</p>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>Total Requests: {profile.ai_usage_stats.total_requests}</p>
            <p>Total Errors: {profile.ai_usage_stats.total_errors}</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ProfileDashboard;

```

## frontend/src/components/ConsciousnessTracker.js
```
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Focus, 
  Sparkles, 
  AlertCircle, 
  Coffee,
  Heart,
  Target,
  Wind,
  Battery
} from 'lucide-react';

const ConsciousnessTracker = ({ 
  consciousnessState, 
  energyLevel, 
  contextClues, 
  onUpdate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedState, setSelectedState] = useState(consciousnessState);
  const [selectedEnergy, setSelectedEnergy] = useState(energyLevel);
  const [selectedContext, setSelectedContext] = useState(contextClues);

  const consciousnessStates = [
    { 
      id: 'focused', 
      label: 'Focused', 
      icon: Target, 
      color: 'green',
      description: 'Clear, directed attention'
    },
    { 
      id: 'hyperfocus', 
      label: 'Hyperfocus', 
      icon: Focus, 
      color: 'purple',
      description: 'Intense, sustained concentration'
    },
    { 
      id: 'creative_flow', 
      label: 'Creative Flow', 
      icon: Sparkles, 
      color: 'pink',
      description: 'Ideas flowing freely'
    },
    { 
      id: 'overwhelmed', 
      label: 'Overwhelmed', 
      icon: AlertCircle, 
      color: 'red',
      description: 'Too much to process'
    },
    { 
      id: 'distracted', 
      label: 'Distracted', 
      icon: Wind, 
      color: 'orange',
      description: 'Attention jumping around'
    },
    { 
      id: 'energy_crash', 
      label: 'Energy Crash', 
      icon: Battery, 
      color: 'gray',
      description: 'Need rest and recovery'
    }
  ];

  const contextOptions = [
    'Very focused on task',
    'Losing track of time',
    'Multiple priorities',
    'Decision paralysis',
    'Creative flow state',
    'Feeling overwhelmed',
    'Need movement/stimulation',
    'Procrastinating',
    'Hyperfocus mode',
    'Energy crash'
  ];

  const handleUpdate = () => {
    onUpdate(selectedState, selectedEnergy, selectedContext);
    setIsExpanded(false);
  };

  const getCurrentStateInfo = () => {
    return consciousnessStates.find(state => state.id === consciousnessState);
  };

  const stateInfo = getCurrentStateInfo();
  const StateIcon = stateInfo?.icon || Brain;

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      layout
    >
      {/* Current State Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <motion.div
            className={`p-3 rounded-lg bg-${stateInfo?.color}-100`}
            whileHover={{ scale: 1.05 }}
          >
            <StateIcon className={`w-6 h-6 text-${stateInfo?.color}-600`} />
          </motion.div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Consciousness State: {stateInfo?.label}
            </h3>
            <p className="text-gray-600 text-sm">{stateInfo?.description}</p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          {isExpanded ? 'Close' : 'Update'}
        </button>
      </div>

      {/* Energy Level Display */}
      <div className="flex items-center space-x-4 mb-4">
        <Zap className="w-5 h-5 text-yellow-500" />
        <span className="text-gray-700 font-medium">Energy Level:</span>
        <div className="flex items-center space-x-1">
          {Array.from({ length: 10 }, (_, i) => (
            <motion.div
              key={i}
              className={`w-3 h-6 rounded ${
                i < energyLevel 
                  ? energyLevel <= 3 
                    ? 'bg-red-400' 
                    : energyLevel <= 6 
                      ? 'bg-yellow-400' 
                      : 'bg-green-400'
                  : 'bg-gray-200'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}
        </div>
        <span className="text-gray-700 font-bold">{energyLevel}/10</span>
      </div>

      {/* Context Clues */}
      {contextClues.length > 0 && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Current context:</p>
          <div className="flex flex-wrap gap-2">
            {contextClues.map((clue, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
              >
                {clue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Expanded Update Form */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-6 mt-6 space-y-6"
          >
            {/* State Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How are you feeling right now?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {consciousnessStates.map((state) => {
                  const Icon = state.icon;
                  const isSelected = selectedState === state.id;

                  return (
                    <motion.button
                      key={state.id}
                      onClick={() => setSelectedState(state.id)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? `border-${state.color}-500 bg-${state.color}-50`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${
                        isSelected ? `text-${state.color}-600` : 'text-gray-400'
                      }`} />
                      <p className={`text-sm font-medium ${
                        isSelected ? `text-${state.color}-700` : 'text-gray-600'
                      }`}>
                        {state.label}
                      </p>
                      <p className={`text-xs mt-1 ${
                        isSelected ? `text-${state.color}-600` : 'text-gray-500'
                      }`}>
                        {state.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Energy Level Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Energy Level: {selectedEnergy}/10
              </label>
              <div className="space-y-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={selectedEnergy}
                  onChange={(e) => setSelectedEnergy(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>Very High</span>
                </div>
              </div>
            </div>

            {/* Context Clues */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What's happening right now? (Select all that apply)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {contextOptions.map((option) => (
                  <motion.button
                    key={option}
                    onClick={() => {
                      const isSelected = selectedContext.includes(option);
                      if (isSelected) {
                        setSelectedContext(prev => prev.filter(item => item !== option));
                      } else {
                        setSelectedContext(prev => [...prev, option]);
                      }
                    }}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      selectedContext.includes(option)
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Update Button */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="btn-dopamine"
              >
                Update State
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ConsciousnessTracker;

```

## frontend/src/components/LoadingSpinner.js
```
import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const LoadingSpinner = ({ message = "Connecting to your consciousness..." }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
        }}
        className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
      >
        <Brain className="w-8 h-8 text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <p className="text-lg font-medium text-gray-700">{message}</p>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-gray-500 mt-2"
        >
          Please wait while we prepare your personalized experience...
        </motion.div>
      </motion.div>

      {/* Animated dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut"
            }}
            className="w-2 h-2 bg-blue-500 rounded-full"
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSpinner;

```

## frontend/src/components/EnhancedMainInterface.tsx
```
# Enhanced MainInterface with Keith's Neural Aurora Gradient Theme

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { SessionState, ConsciousnessState, ConsciousnessStateKey, EnergyLevel, ChatMessage, Achievement } from '../types';
import { ControlPanel } from './ControlPanel';
import { ChatPanel } from './ChatPanel';
import { SessionPanel } from './SessionPanel';
import { SessionSummaryModal } from './SessionSummaryModal';
import { InteractiveTapestry } from './InteractiveTapestry';

interface MainInterfaceProps {
    userName: string;
    onEndSession: () => void;
}

const CONSCIOUSNESS_STATES: Record<ConsciousnessStateKey, ConsciousnessState> = {
    [ConsciousnessStateKey.Hyperfocus]: { 
        key: ConsciousnessStateKey.Hyperfocus, 
        color: "bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-500 text-purple-300", 
        icon: "🔥", 
        description: "Deep focus superpowers activated" 
    },
    [ConsciousnessStateKey.Focused]: { 
        key: ConsciousnessStateKey.Focused, 
        color: "bg-gradient-to-r from-emerald-900/50 to-green-900/50 border-emerald-500 text-emerald-300", 
        icon: "🎯", 
        description: "Steady, productive attention" 
    },
    [ConsciousnessStateKey.Distracted]: { 
        key: ConsciousnessStateKey.Distracted, 
        color: "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-blue-500 text-blue-300", 
        icon: "🦋", 
        description: "Butterfly mind exploring" 
    },
    [ConsciousnessStateKey.Overwhelmed]: { 
        key: ConsciousnessStateKey.Overwhelmed, 
        color: "bg-gradient-to-r from-slate-900/50 to-gray-900/50 border-slate-500 text-slate-300", 
        icon: "🌊", 
        description: "System overload detected" 
    },
    [ConsciousnessStateKey.CreativeFlow]: { 
        key: ConsciousnessStateKey.CreativeFlow, 
        color: "bg-gradient-to-r from-cyan-900/50 to-teal-900/50 border-cyan-500 text-cyan-300", 
        icon: "✨", 
        description: "Creative genius unleashed" 
    },
    [ConsciousnessStateKey.EnergyCrash]: { 
        key: ConsciousnessStateKey.EnergyCrash, 
        color: "bg-gradient-to-r from-indigo-900/50 to-slate-900/50 border-indigo-500 text-indigo-300", 
        icon: "🌱", 
        description: "Restoration time needed" 
    }
};

const ENERGY_LEVELS: EnergyLevel[] = [
    { value: 1, label: "Deep Rest Needed", color: "#818cf8" },
    { value: 2, label: "Low & Gentle", color: "#7dd3fc" },
    { value: 3, label: "Quiet Energy", color: "#67e8f9" },
    { value: 4, label: "Building Up", color: "#5eead4" },
    { value: 5, label: "Steady State", color: "#a7f3d0" },
    { value: 6, label: "Good Energy", color: "#34d399" },
    { value: 7, label: "Strong Power", color: "#fde047" },
    { value: 8, label: "High Energy", color: "#f472b6" },
    { value: 9, label: "Peak Focus", color: "#c084fc" },
    { value: 10, label: "Hyperfocus Fuel", color: "#ef4444" }
];

export const MainInterface: React.FC<MainInterfaceProps> = ({ userName, onEndSession }) => {
    const [session, setSession] = useState<SessionState>({
        userName,
        consciousness: CONSCIOUSNESS_STATES.focused,
        energy: 5,
        selectedContexts: [],
        sessionStart: new Date(),
        tasksCompleted: 0,
        consciousnessShifts: 0,
        achievements: [],
    });
    
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
        { id: 0, sender: 'ai', content: `Welcome, ${userName}! I'm your consciousness-serving AI partner. How are you showing up today?` }
    ]);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [view, setView] = useState<'coach' | 'tapestry'>('coach');
    const [isEmbersActive, setIsEmbersActive] = useState(false);
    const [emberInterval, setEmberInterval] = useState<NodeJS.Timeout | null>(null);

    const addAchievement = useCallback((text: string) => {
        setSession(prev => ({ ...prev, achievements: [...prev.achievements, { id: crypto.randomUUID(), text }] }));
    }, []);

    const handleTaskCompletion = useCallback(() => {
        setSession(prev => ({...prev, tasksCompleted: prev.tasksCompleted + 1 }));
        const achievements = [
            `🎯 Completed task #${session.tasksCompleted + 1}`,
            `⚡ Showing up for yourself!`,
            `🌟 ADHD brain in action!`,
            `🎉 Another win in the books!`
        ];
        addAchievement(achievements[Math.floor(Math.random() * achievements.length)]);
    }, [addAchievement, session.tasksCompleted]);

    const detectConsciousnessState = useCallback(() => {
        let newStateKey = ConsciousnessStateKey.Focused;
        const { selectedContexts, energy } = session;
        if (selectedContexts.includes('Feeling overwhelmed')) newStateKey = ConsciousnessStateKey.Overwhelmed;
        else if (selectedContexts.includes('Creative flow state')) newStateKey = ConsciousnessStateKey.CreativeFlow;
        else if (selectedContexts.includes('Very focused on task') || energy >= 9) newStateKey = ConsciousnessStateKey.Hyperfocus;
        else if (selectedContexts.includes('Decision paralysis')) newStateKey = ConsciousnessStateKey.Distracted;
        else if (energy <= 2) newStateKey = ConsciousnessStateKey.EnergyCrash;

        if (newStateKey !== session.consciousness.key) {
            setSession(prev => ({
                ...prev,
                consciousness: CONSCIOUSNESS_STATES[newStateKey],
                consciousnessShifts: prev.consciousnessShifts + 1,
            }));
        }
    }, [session]);
    
    useEffect(() => {
        detectConsciousnessState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session.energy, session.selectedContexts]);
    
    useEffect(() => {
        const timer = setInterval(() => {
            if (session.sessionStart) {
                const minutes = Math.floor((new Date().getTime() - session.sessionStart.getTime()) / 60000);
                setSessionDuration(minutes);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [session.sessionStart]);

    const handleEndSession = () => {
        setShowSummary(true);
    };

    // Neural Aurora Embers Animation
    const emberColors = ["#10B981", "#06B6D4", "#34D399", "#6EE7B7", "#A78BFA", "#F472B6", "#FBBF24"];
    
    const createEmber = useCallback(() => {
        const ember = document.createElement('div');
        ember.className = 'floating-ember';
        
        const size = Math.random() * 6 + 3; // 3px to 9px
        const speed = Math.random() * 8 + 6; // 6s to 14s duration
        
        ember.style.width = `${size}px`;
        ember.style.height = `${size}px`;
        ember.style.left = `${Math.random() * 100}%`;
        ember.style.opacity = `${Math.random() * 0.7 + 0.3}`; // 0.3 to 1.0
        ember.style.backgroundColor = emberColors[Math.floor(Math.random() * emberColors.length)];
        ember.style.animationDuration = `${speed}s`;
        ember.style.position = 'absolute';
        ember.style.bottom = '-20px';
        ember.style.borderRadius = '50%';
        ember.style.pointerEvents = 'none';
        ember.style.animation = 'float-up 10s linear infinite';
        ember.style.zIndex = '-1';
        
        const container = document.getElementById('ember-container');
        if (container) {
            container.appendChild(ember);
            
            // Remove ember from DOM after animation completes
            setTimeout(() => {
                ember.remove();
            }, speed * 1000);
        }
    }, [emberColors]);

    const startEmbers = useCallback(() => {
        if (isEmbersActive) return;
        setIsEmbersActive(true);
        
        const interval = setInterval(createEmber, 200);
        setEmberInterval(interval);
    }, [isEmbersActive, createEmber]);

    const stopEmbers = useCallback(() => {
        if (!isEmbersActive) return;
        setIsEmbersActive(false);
        
        if (emberInterval) {
            clearInterval(emberInterval);
            setEmberInterval(null);
        }
        
        // Fade out existing embers
        const container = document.getElementById('ember-container');
        if (container) {
            Array.from(container.children).forEach(ember => {
                (ember as HTMLElement).style.transition = 'opacity 0.5s ease';
                (ember as HTMLElement).style.opacity = '0';
                setTimeout(() => ember.remove(), 500);
            });
        }
    }, [isEmbersActive, emberInterval]);

    const toggleEmbers = useCallback(() => {
        if (isEmbersActive) {
            stopEmbers();
        } else {
            startEmbers();
        }
    }, [isEmbersActive, startEmbers, stopEmbers]);

    return (
        <div className="flex flex-col h-screen text-white relative overflow-hidden">
            {/* Keith's Neural Aurora Gradient Background */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 -z-30" />
            <div className="fixed inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -z-20 animate-pulse" />
            
            {/* Floating Embers Container */}
            <div id="ember-container" className="fixed inset-0 -z-10 pointer-events-none" />

            <header className="flex justify-between items-center p-4 bg-slate-900/50 backdrop-blur-md border-b border-emerald-500/20 shadow-sm flex-shrink-0 z-10 component">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        🧠 GestaltView
                    </h1>
                    <span className="text-lg text-emerald-300 hidden sm:block">Hello, {userName}!</span>
                </div>
                
                <div className="flex items-center gap-2 p-1 bg-slate-800/50 rounded-lg component">
                    <button 
                        onClick={() => setView('coach')} 
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all touch-target ${
                            view === 'coach' 
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900' 
                                : 'text-emerald-300 hover:bg-slate-700/50 hover:scale-105'
                        }`}
                    >
                        Coach
                    </button>
                    <button 
                        onClick={() => setView('tapestry')} 
                        className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all touch-target ${
                            view === 'tapestry' 
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-600 text-slate-900' 
                                : 'text-emerald-300 hover:bg-slate-700/50 hover:scale-105'
                        }`}
                    >
                        Tapestry
                    </button>
                </div>
                
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium component ${session.consciousness.color}`}>
                        <span className="text-xl">{session.consciousness.icon}</span>
                        <span className="hidden md:inline">{session.consciousness.description}</span>
                    </div>
                    
                    <button 
                        onClick={toggleEmbers}
                        className="px-3 py-2 text-sm font-semibold bg-slate-700/50 text-emerald-300 rounded-md hover:bg-slate-600/50 hover:text-white transition touch-target"
                    >
                        {isEmbersActive ? 'Disable Embers' : 'Enable Embers'}
                    </button>
                    
                    <div className="text-sm font-medium text-emerald-200 bg-slate-700/50 px-3 py-1.5 rounded-full hidden lg:block component">
                        Session: {sessionDuration}m
                    </div>
                    
                    <button 
                        onClick={handleEndSession} 
                        className="px-4 py-2 text-sm font-semibold bg-slate-700/50 text-emerald-300 rounded-md hover:bg-slate-600/50 hover:text-white transition touch-target"
                    >
                        End Session
                    </button>
                </div>
            </header>

            <main className={`flex-grow p-4 grid gap-4 overflow-hidden ${view === 'coach' ? 'grid-cols-1 lg:grid-cols-[300px_1fr_300px]' : 'grid-cols-1'}`}>
                {view === 'coach' ? (
                    <>
                        <div className="component">
                            <ControlPanel 
                                session={session} 
                                setSession={setSession} 
                                energyLevels={ENERGY_LEVELS} 
                                setChatHistory={setChatHistory} 
                            />
                        </div>
                        <div className="component">
                            <ChatPanel 
                                session={session} 
                                chatHistory={chatHistory} 
                                setChatHistory={setChatHistory} 
                                addAchievement={addAchievement} 
                                onTaskComplete={handleTaskCompletion} 
                                energyLevels={ENERGY_LEVELS} 
                            />
                        </div>
                        <div className="component">
                            <SessionPanel session={session} />
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full min-h-0 component">
                        <InteractiveTapestry />
                    </div>
                )}
            </main>
            
            {showSummary && (
                <SessionSummaryModal 
                    session={session} 
                    duration={sessionDuration} 
                    onClose={() => setShowSummary(false)} 
                    onNewSession={onEndSession} 
                />
            )}

            {/* CSS for animations */}
            <style jsx>{`
                @keyframes float-up {
                    0% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-110vh);
                        opacity: 0;
                    }
                }
                
                .floating-ember {
                    position: absolute;
                    bottom: -20px;
                    border-radius: 50%;
                    pointer-events: none;
                    animation: float-up 10s linear infinite;
                    z-index: -1;
                }

                .component {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                    transition: all 0.3s ease;
                }

                .component:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 6px 35px rgba(0, 0, 0, 0.2);
                }

                .touch-target {
                    min-height: 44px;
                    min-width: 44px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }

                .touch-target:active {
                    transform: scale(0.95);
                }

                .hyperfocus-mode {
                    border: 3px solid #F59E0B;
                    animation: hyperfocus-pulse 2s infinite;
                }

                @keyframes hyperfocus-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 hsla(38, 92%, 50%, 0.4); }
                    50% { box-shadow: 0 0 0 8px hsla(38, 92%, 50%, 0); }
                }

                @media (prefers-reduced-motion: reduce) {
                    *, *::before, *::after {
                        animation-duration: 0.01ms !important;
                        animation-iteration-count: 1 !important;
                        transition-duration: 0.01ms !important;
                        scroll-behavior: auto !important;
                    }
                }
            `}</style>
        </div>
    );
};

              export default app.tsx 

```

## frontend/src/GlassCard.css
```
/* src/GlassCard.css */
.component-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.component {
  background: rgba(255, 255, 255, 0.1); 
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(5px);
  max-width: 400px;
  text-align: center;
}

```

