import axios from "axios";

async function processFacebookLink(
  shortLink: string
): Promise<{ longLink: string; formattedId: string } | null> {
  function extractLink(input: string): string | null {
    // Expression régulière pour capturer un lien HTTP ou HTTPS
    const regex = /(https?:\/\/[^\s]+)/;
    const match = input.match(regex);

    // Si un lien est trouvé, on le retourne, sinon on retourne null
    return match ? match[0] : null;
  }

  //   // Exemple d'utilisation
  //   const inputString =
  //     "https://fb.me/hTcrCk8rQ Bonjour ! Puis-je en savoir plus à ce sujet ?";
  const extractedLink = extractLink(shortLink);
  console.log("📎 Lien extrait :", extractedLink);
  try {
    // Étape 1 : Récupérer le lien long
    const response = await axios.head(extractedLink ?? "", {
      maxRedirects: 10,
    });
    const longLink = response.request.res.responseUrl;

    // Étape 2 : Extraire les identifiants depuis le lien long
    const regex = /facebook\.com\/(\d+)\/videos\/(\d+)/;
    const match = longLink.match(regex);

    if (match) {
      const pageId = match[1];
      const videoId = match[2];
      const formattedId = `${pageId}_${videoId}`;

      return { longLink, formattedId };
    } else {
      throw new Error(
        "Les identifiants n'ont pas pu être extraits du lien long."
      );
    }
  } catch (error: any) {
    console.error("Erreur :", error.message);
    return null;
  }
}

export default processFacebookLink;
