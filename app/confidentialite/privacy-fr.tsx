import Link from "@/components/link";
import { CONTACT, Section, UPDATED_AT } from "./section";

export function PrivacyFr() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-16">
      <header>
        <p className="font-mono text-[10px] tracking-[0.2em] text-ocre uppercase">Mentions · RGPD</p>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,11vw,4.5rem)] leading-[1] text-balance">
          Politique de <span className="italic text-muted-foreground">confidentialité</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
          Le Guide des Locaux collecte le strict minimum pour faire fonctionner votre carnet de voyage. Pas de publicité,
          pas de revente de données, pas d&apos;outil de suivi.
        </p>
        <p className="mt-4 font-mono text-[11px] tracking-wide text-muted-foreground">Dernière mise à jour : {UPDATED_AT.fr}</p>
      </header>

      <div className="mt-12 space-y-10">
        <Section id="responsable" title="Responsable du traitement">
          <p>
            Le site <strong>ebook.martinvantalon.com</strong> (« Nice &amp; Côte d&apos;Azur · Le Guide des Locaux ») est édité
            par Martin Vantalon, développeur indépendant. Pour toute question relative à vos données :{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
          </p>
        </Section>

        <Section id="donnees" title="Données collectées">
          <p>Vous pouvez consulter le guide sans compte : aucune donnée personnelle n&apos;est alors enregistrée.</p>
          <p>Si vous créez un compte (email et mot de passe, lien magique ou « Continuer avec Google »), nous enregistrons :</p>
          <ul>
            <li>
              <strong>Votre adresse email</strong>, pour vous identifier et vous envoyer les emails de connexion ;
            </li>
            <li>
              <strong>Votre nom et votre photo de profil</strong>, uniquement s&apos;ils sont fournis par Google lors d&apos;une
              connexion Google (ou saisis à l&apos;inscription) ;
            </li>
            <li>
              <strong>Vos favoris et vos itinéraires</strong> (les adresses que vous sauvegardez, les carnets que vous créez).
            </li>
          </ul>
          <p>Votre mot de passe, si vous en utilisez un, n&apos;est jamais stocké en clair : il est chiffré par notre prestataire d&apos;authentification.</p>
        </Section>

        <Section id="google" title="Connexion avec Google">
          <p>
            Si vous choisissez « Continuer avec Google », nous demandons uniquement les autorisations{" "}
            <strong>openid</strong>, <strong>email</strong> et <strong>profile</strong>, c&apos;est-à-dire votre adresse email,
            votre nom et votre photo de profil. Nous n&apos;accédons à aucune autre donnée de votre compte Google (Gmail,
            Drive, contacts, agenda…).
          </p>
          <p>
            Ces informations servent exclusivement à créer et identifier votre compte sur le Guide des Locaux. Elles ne sont
            ni vendues, ni partagées avec des tiers, ni utilisées à des fins publicitaires ou pour entraîner des modèles
            d&apos;intelligence artificielle. L&apos;utilisation des informations reçues des API Google respecte la{" "}
            <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">
              Règle relative aux données utilisateur des services API Google
            </a>
            , y compris les exigences d&apos;utilisation limitée (« Limited Use »).
          </p>
        </Section>

        <Section id="finalites" title="Pourquoi et sur quelle base">
          <ul>
            <li>
              <strong>Gérer votre compte et votre carnet</strong> (favoris, itinéraires) : exécution du service que vous
              demandez en créant un compte.
            </li>
            <li>
              <strong>Partager un carnet</strong> : uniquement si vous le rendez public vous-même. Le carnet partagé montre son
              titre et ses adresses, jamais votre email.
            </li>
            <li>
              <strong>Sécuriser le site</strong> (sessions, prévention des abus) : intérêt légitime.
            </li>
          </ul>
        </Section>

        <Section id="cookies" title="Cookies et stockage local">
          <p>Le site n&apos;utilise que des éléments strictement nécessaires à son fonctionnement, sans consentement requis :</p>
          <ul>
            <li>
              <strong>Cookies de session</strong> de notre prestataire d&apos;authentification (Supabase), déposés uniquement si
              vous vous connectez, pour vous garder connecté ;
            </li>
            <li>
              <strong>Cookie de langue</strong> (« lang »), qui mémorise votre choix français / anglais pendant un an ;
            </li>
            <li>
              <strong>Votre position GPS</strong>, uniquement si vous touchez « Me localiser » sur la carte et
              l&apos;autorisez : elle sert à afficher le point bleu et reste dans votre navigateur, sans jamais être
              envoyée ni enregistrée ;
            </li>
            <li>
              <strong>Stockage local du navigateur</strong> : votre choix de thème clair/sombre, et l&apos;adresse que vous
              vouliez sauvegarder avant de vous connecter (effacée après connexion, ou au bout de 30 minutes).
            </li>
          </ul>
          <p>Aucun cookie publicitaire, de mesure d&apos;audience ou de réseau social.</p>
          <p>
            Pour savoir quelles pages sont consultées, nous utilisons <strong>Vercel Web Analytics</strong>, une mesure
            d&apos;audience anonyme et sans cookie : elle ne dépose rien sur votre appareil, ne vous suit pas d&apos;un site à
            l&apos;autre et ne conserve que des statistiques agrégées (pages vues, pays, type d&apos;appareil).
          </p>
        </Section>

        <Section id="prestataires" title="Prestataires et hébergement">
          <p>Vos données sont traitées par des prestataires techniques, uniquement pour faire fonctionner le site :</p>
          <ul>
            <li>
              <strong>Supabase</strong> : base de données, authentification et stockage des photos ;
            </li>
            <li>
              <strong>Vercel</strong> : hébergement et diffusion du site, statistiques de visite anonymes ;
            </li>
            <li>
              <strong>Google</strong> : uniquement si vous choisissez la connexion Google ;
            </li>
            <li>
              <strong>CARTO</strong> : fonds de carte affichés sur la carte interactive (reçoit, comme tout serveur web,
              votre adresse IP lors du chargement des tuiles).
            </li>
          </ul>
          <p>
            Certains de ces prestataires peuvent traiter des données hors de l&apos;Union européenne ; ces transferts sont
            encadrés par les clauses contractuelles types de la Commission européenne. Les liens « Google Maps » et
            « Waze » d&apos;une fiche ne transmettent rien tant que vous ne cliquez pas dessus.
          </p>
        </Section>

        <Section id="conservation" title="Durée de conservation">
          <p>
            Vos données sont conservées tant que votre compte existe. Si vous demandez la suppression de votre compte, votre
            email, votre profil, vos favoris et vos itinéraires sont définitivement effacés dans un délai de 30 jours.
          </p>
        </Section>

        <Section id="droits" title="Vos droits">
          <p>
            Conformément au RGPD, vous pouvez à tout moment accéder à vos données, les rectifier, les exporter, vous opposer à
            leur traitement ou demander leur suppression, en écrivant à <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. Nous
            répondons sous 30 jours.
          </p>
          <p>
            Vous pouvez aussi retirer l&apos;accès du Guide des Locaux à votre compte Google depuis{" "}
            <a href="https://myaccount.google.com/connections" target="_blank" rel="noopener noreferrer">
              myaccount.google.com/connections
            </a>
            , et introduire une réclamation auprès de la{" "}
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">
              CNIL
            </a>
            .
          </p>
        </Section>

        <Section id="modifications" title="Modifications">
          <p>
            Cette politique peut évoluer avec le site. La date de dernière mise à jour figure en haut de la page ; en cas de
            changement important, les utilisateurs inscrits en seront informés par email.
          </p>
        </Section>
      </div>

      <p className="mt-16 border-t border-line pt-8 text-sm text-muted-foreground">
        <Link href="/" className="underline underline-offset-2 hover:text-foreground">
          ← Retour au guide
        </Link>
      </p>
    </article>
  );
}
