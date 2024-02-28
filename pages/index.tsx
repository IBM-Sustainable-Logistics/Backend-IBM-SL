/** @jsx jsx */
/** @jsxFrag Fragment */

import { FC } from "https://deno.land/x/hono@v4.0.7/middleware.ts"
import { jsx, Fragment } from "https://deno.land/x/hono@v4.0.7/middleware.ts"
import { css, cx, keyframes, Style } from 'https://deno.land/x/hono/helper.ts'
import { app } from "../main.ts"


const background = css `
  background: #edf5ff;
`

const headerClass = css`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-weight: normal;
  color: #42be65;
  padding: 1rem;
`

const button = css `
  background-color: #0f62fe;
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;

`

const flex = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  padding-top: 50px;
`  

const logo = css`
  width: 200px;
`

export const Layout: FC = (props) => {
  return (
    <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <Style />
      <title >IBM SL</title>
    </head>
      <body class={background}>{props.children}</body>
    </html>
  )
}

export const Top: FC = () => {
  return (
    <Layout>
      <div class={flex}>
          <img class={logo} src="/logo.svg"></img>
         <h1 class={headerClass} >Welcome to IBM SL</h1>
         <a href="https://ibm-sl.deno.dev/"><button class={button}> Read more </button></a>
      </div>

    </Layout>
  )
}

export async function Index () {
  app.get('/', (c) => {
    return c.html(<Top />)
  })
}



