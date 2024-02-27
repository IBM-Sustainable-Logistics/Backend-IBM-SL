/** @jsx jsx */
/** @jsxFrag Fragment */

import { FC } from "https://deno.land/x/hono@v4.0.7/middleware.ts"
import { jsx, Fragment } from "https://deno.land/x/hono@v4.0.7/middleware.ts"
import { app } from "../main.ts"

export const Layout: FC = (props) => {
  return (
    <html>
      <body>{props.children}</body>
    </html>
  )
}

export const Top: FC = () => {
  return (
    <Layout>
      <h1>Welcome to IBM SL</h1>
    </Layout>
  )
}

export async function Index () {
  app.get('/', (c) => {
    return c.html(<Top />)
  })
}



