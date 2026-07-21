# IGCSEMYSG Exam Intelligence setup

This package adds an authenticated learning platform at `/exam-intelligence/`. It works immediately in demo mode. Real accounts, cross-device progress and live AI require Supabase.

## 1. Add the files

Copy `exam-intelligence/` and `supabase/` to the root of the GitHub Pages repository. Add this link to the main navigation:

```html
<a href="exam-intelligence/">Exam Intelligence</a>
```

## 2. Configure Supabase

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Authentication → URL configuration, add the GitHub Pages URL and custom domain as redirect URLs.
4. Copy the Project URL and public anon key into `exam-intelligence/config.js`.

The anon key is intended for browser use. Row Level Security in `schema.sql` prevents students from reading each other's records. Never put the service-role key or OpenAI key in GitHub.

## 3. Deploy the secure tutor

Install the Supabase CLI, log in and run:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase secrets set OPENAI_API_KEY=YOUR_KEY
supabase secrets set ANTHROPIC_API_KEY=YOUR_KEY
supabase secrets set MOONSHOT_API_KEY=YOUR_KEY
supabase secrets set ALLOWED_ORIGINS=https://igcsemysg.site,https://igcsemysg-ctrl.github.io
supabase functions deploy tutor
```

Optionally set `OPENAI_MODEL`. The tutor function requires an authenticated Supabase session and keeps the OpenAI key server-side.

Claude and Kimi are optional. When their keys are configured and the student explicitly enables panel mode, OpenAI, Claude and Kimi analyse the request independently. The synthesis tutor compares their conclusions and presents one concise answer. It does not expose provider reasoning traces or store raw provider responses. If a provider is unavailable, the system continues with the successful providers.

For privacy and cost control, panel mode is off by default. It records consent, sends only minimized learning context without email or display name, and should be reserved for difficult questions. Use the providers' API products; do not automate consumer ChatGPT, Claude or Kimi accounts.

## Security controls included

- Verified Supabase JWT on every AI request
- Row Level Security ownership checks using `auth.uid()`
- Anonymous database access revoked
- Separate select, insert, update and delete policies
- Per-account AI limits enforced in the database
- Per-account conversation history and learning insights
- Explicit consent before learning context is shared with additional AI providers
- No account name or email sent to the model panel
- Browser-origin allowlist for the tutor endpoint
- Request size, message-history and input validation
- Generic server errors that do not expose internal details
- OpenAI key restricted to the server-side function
- Content Security Policy restricting scripts and connections
- Output escaping for AI chat messages

The browser anon key is public by design; it does not grant cross-account access when RLS is enabled. Never expose the Supabase service-role key or OpenAI key. Before public launch, enable email confirmation, leaked-password protection, CAPTCHA and suitable authentication rate limits in the Supabase dashboard. Run Supabase Security Advisor after every schema change.

## 4. Current product capabilities

- Email sign-up, sign-in and sign-out
- Per-user progress protected by database policies
- Multi-board and multi-subject selection
- Topic mastery dashboard
- Guided topic lessons
- Adaptive questions with explanations
- Interactive teaching-focused AI tutor
- Weekly revision plan
- Local demo mode before backend setup
- Responsive desktop and mobile layouts

## 5. Production priorities

Before enrolling real students, add verified syllabus content and licensed/permitted question data, an educator content-review workflow, privacy terms, account deletion, parental consent rules where applicable, and monitoring for unsafe or incorrect tutor responses.
