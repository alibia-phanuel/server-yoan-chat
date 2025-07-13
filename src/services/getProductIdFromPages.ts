import axios from "axios";

async function getProductIdFromPages(
  productId: string
): Promise<string | null> {
  // Tokens d'accès des deux pages
  const accessTokenPage1 =
    "EAAQZBjOj8ZBnsBOZBKGVVCwFkmn0gKe0msJpZC3x12ziyGy5dV9rAaQlInuUZBCbIP6xhZCCZAODRdZA68COfpVDH0kVie67oBNHZCt7JdFXKwxNpTvdq49gMgISK2CdjyIgnPqy77H7fQWNkmpVZBuj6Bkr0NdaJLkkmLiMFDla2bIj96BEZCUhxj31w3n6BQVstMP";
  const accessTokenPage2 =
    "EAAQZBjOj8ZBnsBOwfRuDcIhE40VZB1wlp103GAQR8g9witj4pZBFxk6aRIFbZB01P6ZAelOnQL7EtHy5uwTKAGdaUTAj0nim23kl3E4ACZBZBF5m2SRiZBoOXnRyegDPzGsWfASIp8fZC4YVuSCaetMZAv2rHciaEepZBZCl7qu5oMRbXblc3YjHLZCpJ2Pkl9rjKqPdsZD";

  const url = (productId: string, accessToken: string) =>
    `https://graph.facebook.com/v22.0/${productId}?fields=id&access_token=${accessToken}`;

  const fetchProductId = async (
    productId: string,
    accessToken: string
  ): Promise<string | null> => {
    try {
      const response = await axios.get(url(productId, accessToken));
      return response.data?.id || null;
    } catch (error) {
      return null;
    }
  };

  // Essayer avec la première page
  let productIdFound = await fetchProductId(productId, accessTokenPage1);

  // Si pas trouvé, essayer avec la deuxième
  if (!productIdFound) {
    productIdFound = await fetchProductId(productId, accessTokenPage2);
  }

  return productIdFound;
}

export default getProductIdFromPages;
