// Server起動ファイル

import app from './src/app.js';
import { PORT } from './src/config/env.js';

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`- Basic Auth: http://localhost:${PORT}/basic-auth`);
    console.log(`- Login:      http://localhost:${PORT}/login`);
    console.log(`- Profile:    http://localhost:${PORT}/user/profile`);
});