# Upload a file to Aiexec with Next.js

This example shows how to upload a file to Aiexec using the Aiexec TypeScript SDK and Node.js. It uses [Next.js](https://nextjs.org/) to render a simple form with a file input. When the form is submitted, the file is uploaded to Aiexec via a Next.js API Route and the Aiexec-hosted URL is returned.

> **Note**
> While this example uses Next.js, this approach can be used with any Node.js backend.

To run this example, you'll need a Aiexec account and a Aiexec API key. You can create an API key from your personal [Aiexec settings](https://aiexec.khulnasoft.com/settings/account/security). Learn more about authentication in the [Aiexec Developer documentation](https://developers.aiexec.khulnasoft.com/docs/sdk/getting-started#2.-create-a-aiexec-client).

> **Note**
> This example is part of a guide: ["How to upload a file to Aiexec"](https://developers.aiexec.khulnasoft.com/guides/how-to-upload-a-file-to-aiexec).

## Run the example

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) to bootstrap the example:

```shell
yarn create next-app --example https://github.com/khulnasoft-lab/aiexec/tree/master/examples/nextjs-file-upload nextjs-file-upload
```

Then rename `.env.local.example` to `.env.local` and add your API key:

```
# Rename .env.local.example → .env.local
AIEXEC_API_KEY="YOUR_API_KEY"
```

Finally, `cd` into the directory and run the Next.js development server:

```shell
cd nextjs-file-upload
yarn dev
```

Visit [`http://localhost:3000`](http://localhost:3000) to see the running example.
