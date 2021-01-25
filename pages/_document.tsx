import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from 'next/document'
const sprite = require('svg-sprite-loader/runtime/sprite.build')

export default class CustomDocument extends Document<{
  spriteContent: string
}> {
  public static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    const spriteContent = sprite.stringify()

    return {
      spriteContent,
      ...initialProps,
    }
  }

  public render() {
    return (
      <Html>
        <Head />
        <body>
          <div dangerouslySetInnerHTML={{ __html: this.props.spriteContent }} />
          <Main />
          <NextScript />
          <script src="https://www.gstatic.com/firebasejs/8.2.1/firebase-app.js" />
        </body>
      </Html>
    )
  }
}
