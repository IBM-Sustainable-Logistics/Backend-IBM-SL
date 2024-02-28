import { app } from '../main.ts';
import * as fs from 'https://deno.land/std@0.110.0/node/fs.ts';

async function main() {
    const res = await app.request('/doc?yaml');
    const text = await res.text();

    fs.writeFileSync(`./openapi.yaml`, text, {
        encoding: 'utf-8',
    });
}
main();
