import Link from "@/components/link";
import { CONTACT, Section, UPDATED_AT } from "./section";

export function PrivacyEn() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <header>
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Legal · GDPR</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,11vw,4.5rem)] leading-[1] text-balance">
          Privacy <span className="italic text-muted-foreground">policy</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          The Locals&apos; Guide collects the bare minimum needed to run your travel list. No advertising, no selling of
          data, no tracking tools.
        </p>
        <p className="mt-4 font-mono text-[11px] tracking-wide text-muted-foreground">Last updated: {UPDATED_AT.en}</p>
      </header>

      <div className="mt-12 space-y-10">
        <Section id="controller" title="Data controller">
          <p>
            The website <strong>ebook.martinvantalon.com</strong> (&ldquo;Nice &amp; the French Riviera — The Locals&apos;
            Guide&rdquo;) is published by Martin Vantalon, independent developer. For any question about your data:{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </Section>

        <Section id="data" title="Data we collect">
          <p>You can browse the guide without an account: no personal data is stored in that case.</p>
          <p>If you create an account (email and password, magic link or &ldquo;Continue with Google&rdquo;), we store:</p>
          <ul>
            <li>
              <strong>Your email address</strong>, to identify you and send you sign-in emails;
            </li>
            <li>
              <strong>Your name and profile picture</strong>, only if provided by Google when you sign in with Google (or
              entered when you sign up);
            </li>
            <li>
              <strong>Your favourites and itineraries</strong> (the places you save and the lists you create).
            </li>
          </ul>
          <p>If you use a password, it is never stored in plain text: it is encrypted by our authentication provider.</p>
        </Section>

        <Section id="google" title="Signing in with Google">
          <p>
            If you choose &ldquo;Continue with Google&rdquo;, we only request the <strong>openid</strong>,{" "}
            <strong>email</strong> and <strong>profile</strong> permissions, i.e. your email address, name and profile
            picture. We do not access any other data from your Google account (Gmail, Drive, contacts, calendar…).
          </p>
          <p>
            This information is used solely to create and identify your account on the Locals&apos; Guide. It is never
            sold, shared with third parties, used for advertising or used to train artificial intelligence models. Our use
            of information received from Google APIs adheres to the{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>
        </Section>

        <Section id="purposes" title="Why, and on what legal basis">
          <ul>
            <li>
              <strong>Managing your account and your list</strong> (favourites, itineraries): performance of the service you
              request by creating an account.
            </li>
            <li>
              <strong>Sharing a list</strong>: only if you make it public yourself. A shared list shows its title and places,
              never your email.
            </li>
            <li>
              <strong>Keeping the site secure</strong> (sessions, abuse prevention): legitimate interest.
            </li>
          </ul>
        </Section>

        <Section id="cookies" title="Cookies and local storage">
          <p>The site only uses what is strictly necessary for it to work, which requires no consent:</p>
          <ul>
            <li>
              <strong>Session cookies</strong> from our authentication provider (Supabase), set only if you sign in, to keep
              you signed in;
            </li>
            <li>
              <strong>Language cookie</strong> (&ldquo;lang&rdquo;), which remembers your French / English choice for one
              year;
            </li>
            <li>
              <strong>Your GPS location</strong>, only if you tap &ldquo;Find my location&rdquo; on the map and allow it: it
              is used to show the blue dot and stays in your browser, never sent or stored;
            </li>
            <li>
              <strong>Browser local storage</strong>: your light/dark theme choice, and the place you wanted to save before
              signing in (deleted after sign-in, or after 30 minutes).
            </li>
          </ul>
          <p>No advertising, analytics or social media cookies.</p>
        </Section>

        <Section id="providers" title="Service providers and hosting">
          <p>Your data is processed by technical providers, solely to run the site:</p>
          <ul>
            <li>
              <strong>Supabase</strong>: database, authentication and photo storage;
            </li>
            <li>
              <strong>Vercel</strong>: hosting and delivery of the site;
            </li>
            <li>
              <strong>Google</strong>: only if you choose to sign in with Google;
            </li>
            <li>
              <strong>CARTO</strong>: base maps shown on the interactive map (like any web server, it receives your IP
              address when map tiles load).
            </li>
          </ul>
          <p>
            Some of these providers may process data outside the European Union; such transfers are covered by the European
            Commission&apos;s standard contractual clauses. The &ldquo;Google Maps&rdquo; and &ldquo;Waze&rdquo; links on a
            place page send nothing until you click them.
          </p>
        </Section>

        <Section id="retention" title="How long we keep your data">
          <p>
            Your data is kept for as long as your account exists. If you ask for your account to be deleted, your email,
            profile, favourites and itineraries are permanently erased within 30 days.
          </p>
        </Section>

        <Section id="rights" title="Your rights">
          <p>
            Under the GDPR, you can at any time access, correct or export your data, object to its processing or ask for it
            to be deleted, by writing to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We reply within 30 days.
          </p>
          <p>
            You can also remove the Locals&apos; Guide&apos;s access to your Google account at{" "}
            <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">
              myaccount.google.com/connections
            </a>
            , and lodge a complaint with the French data protection authority, the{" "}
            <a href="https://www.cnil.fr/en/home" target="_blank" rel="noopener noreferrer">
              CNIL
            </a>
            .
          </p>
        </Section>

        <Section id="changes" title="Changes">
          <p>
            This policy may change as the site evolves. The last update date is shown at the top of the page; registered
            users will be notified by email of any significant change.
          </p>
        </Section>
      </div>

      <p className="mt-16 border-t border-line pt-8 text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">
          ← Back to the guide
        </Link>
      </p>
    </article>
  );
}
