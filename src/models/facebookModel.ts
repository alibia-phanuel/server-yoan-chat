import axios from "axios";

const pages = {
  afrikagadget: {
    id: "101051433077608",
    access_token:
      "EAAQZBjOj8ZBnsBOxk2fxfIohZAaTsVQ0j19cjJHz1W0qzihezbZA5vnS56QXLWywwNfzZAx5wNFfkZAxsstNEXMMlI1OlfFG5re8YsfvqKZCq30itP1ZA12vBRXepROJOhLyVFZB5UnqHlzyfZAmlGWIhrmagN2om4GJCo37jZBQRh8rcJvmS64vcYdpPXlZA7hlDZCoZD",
  },
  topqualites: {
    id: "389037834288932",
    access_token:
      "EAAQZBjOj8ZBnsBOZBKGVVCwFkmn0gKe0msJpZC3x12ziyGy5dV9rAaQlInuUZBCbIP6xhZCCZAODRdZA68COfpVDH0kVie67oBNHZCt7JdFXKwxNpTvdq49gMgISK2CdjyIgnPqy77H7fQWNkmpVZBuj6Bkr0NdaJLkkmLiMFDla2bIj96BEZCUhxj31w3n6BQVstMP",
  },
};

export const getFacebookPosts = async (
  pageName: "afrikagadget" | "topqualites"
) => {
  const page = pages[pageName];
  const url = `https://graph.facebook.com/v22.0/${page.id}/posts`;

  const response = await axios.get(url, {
    params: {
      access_token: page.access_token,
    },
  });

  return response.data;
};
