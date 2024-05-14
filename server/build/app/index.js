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
exports.initServer = void 0;
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
const user_1 = require("./user");
const post_1 = require("./post");
const jwt_1 = __importDefault(require("../services/jwt"));
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)();
        app.use(body_parser_1.default.json());
        app.use((0, cors_1.default)());
        app.get("/", (req, res) => res.status(200).json({ message: "Everything is good" }));
        const graphqlServer = new server_1.ApolloServer({
            typeDefs: `
       ${user_1.User.types}
       ${post_1.Post.types}

        type Query {
            ${user_1.User.queries}
            ${post_1.Post.queries}
        }

        type Mutation {
          ${post_1.Post.muatations}
          ${user_1.User.mutations}
        }
    `,
            resolvers: Object.assign(Object.assign({ Query: Object.assign(Object.assign({}, user_1.User.resolvers.queries), post_1.Post.resolvers.queries), Mutation: Object.assign(Object.assign({}, post_1.Post.resolvers.mutations), user_1.User.resolvers.mutations) }, post_1.Post.resolvers.extraResolvers), user_1.User.resolvers.extraResolvers),
        });
        yield graphqlServer.start();
        app.use("/graphql", (0, express4_1.expressMiddleware)(graphqlServer, {
            context: ({ req, res }) => __awaiter(this, void 0, void 0, function* () {
                return {
                    user: req.headers.authorization
                        ? jwt_1.default.decodeToken(req.headers.authorization.split("Bearer ")[1])
                        : undefined,
                };
            }),
        }));
        const sslOptions = {
            key: fs_1.default.readFileSync('/home/vineet/thunder-link-server/server/src/private.key'),
            cert: fs_1.default.readFileSync('/home/vineet/thunder-link-server/server/src/certificate.crt'),
            ca: fs_1.default.readFileSync('/home/vineet/thunder-link-server/server/src/ca_bundle.crt') // Optional: Including CA bundle if provided
        };
        // Create HTTPS server
        const httpsServer = https_1.default.createServer(sslOptions, app);
        // Specify HTTPS port
        const PORT = 3000; // Default port for HTTPS is 443
        // Start HTTPS server
        httpsServer.listen(PORT, () => {
            console.log(`HTTPS Server is running on https://localhost:${PORT}`);
        });
        return app;
    });
}
exports.initServer = initServer;
