// components/utility/MetaTags.tsx
import Head from "next/head";

interface MetaTagsProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

export function MetaTags({
  title,
  description = "Connect and share on our decentralized social platform",
  image = "/og-image.png",
  url,
}: MetaTagsProps) {
  const fullTitle = `${title} | Social Media DApp`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Head>
  );
}
