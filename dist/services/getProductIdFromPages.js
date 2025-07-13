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
const axios_1 = __importDefault(require("axios"));
function getProductIdFromPages(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Tokens d'accès des deux pages
        const accessTokenPage1 = "EAAQZBjOj8ZBnsBOZBKGVVCwFkmn0gKe0msJpZC3x12ziyGy5dV9rAaQlInuUZBCbIP6xhZCCZAODRdZA68COfpVDH0kVie67oBNHZCt7JdFXKwxNpTvdq49gMgISK2CdjyIgnPqy77H7fQWNkmpVZBuj6Bkr0NdaJLkkmLiMFDla2bIj96BEZCUhxj31w3n6BQVstMP";
        const accessTokenPage2 = "EAAQZBjOj8ZBnsBOwfRuDcIhE40VZB1wlp103GAQR8g9witj4pZBFxk6aRIFbZB01P6ZAelOnQL7EtHy5uwTKAGdaUTAj0nim23kl3E4ACZBZBF5m2SRiZBoOXnRyegDPzGsWfASIp8fZC4YVuSCaetMZAv2rHciaEepZBZCl7qu5oMRbXblc3YjHLZCpJ2Pkl9rjKqPdsZD";
        const url = (productId, accessToken) => `https://graph.facebook.com/v22.0/${productId}?fields=id&access_token=${accessToken}`;
        const fetchProductId = (productId, accessToken) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield axios_1.default.get(url(productId, accessToken));
                return ((_a = response.data) === null || _a === void 0 ? void 0 : _a.id) || null;
            }
            catch (error) {
                return null;
            }
        });
        // Essayer avec la première page
        let productIdFound = yield fetchProductId(productId, accessTokenPage1);
        // Si pas trouvé, essayer avec la deuxième
        if (!productIdFound) {
            productIdFound = yield fetchProductId(productId, accessTokenPage2);
        }
        return productIdFound;
    });
}
exports.default = getProductIdFromPages;
