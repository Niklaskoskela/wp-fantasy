"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const contentRoutes_1 = __importDefault(require("./routes/contentRoutes"));
const cors_1 = __importDefault(require("cors"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const matchDayRoutes_1 = __importDefault(require("./routes/matchDayRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});
app.use('/api', contentRoutes_1.default);
app.use('/api', teamRoutes_1.default);
app.use('/api', matchDayRoutes_1.default);
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map