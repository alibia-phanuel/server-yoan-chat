"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFacebookPosts = void 0;
const axios_1 = __importDefault(require("axios"));
const pages = {
    afrikagadget: {
        id: "101051433077608",
        access_token: "EAAQZBjOj8ZBnsBOxk2fxfIohZAaTsVQ0j19cjJHz1W0qzihezbZA5vnS56QXLWywwNfzZAx5wNFfkZAxsstNEXMMlI1OlfFG5re8YsfvqKZCq30itP1ZA12vBRXepROJOhLyVFZB5UnqHlzyfZAmlGWIhrmagN2om4GJCo37jZBQRh8rcJvmS64vcYdpPXlZA7hlDZCoZD",
    },
    topqualites: {
        id: "389037834288932",
        access_token: "EAAQZBjOj8ZBnsBOZBKGVVCwFkmn0gKe0msJpZC3x12ziyGy5dV9rAaQlInuUZBCbIP6xhZCCZAODRdZA68COfpVDH0kVie67oBNHZCt7JdFXKwxNpTvdq49gMgISK2CdjyIgnPqy77H7fQWNkmpVZBuj6Bkr0NdaJLkkmLiMFDla2bIj96BEZCUhxj31w3n6BQVstMP",
    },
};
const getFacebookPosts = (pageName) => __awaiter(void 0, void 0, void 0, function* () {
    const page = pages[pageName];
    const url = `https://graph.facebook.com/v22.0/${page.id}/posts`;
    const response = yield axios_1.default.get(url, {
        params: {
            access_token: page.access_token,
        },
    });
    return response.data;
});
exports.getFacebookPosts = getFacebookPosts;
