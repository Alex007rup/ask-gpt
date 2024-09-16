const express = require('express');
const path = require('path');
const { marked } = require('marked');
const hljs = require('highlight.js');

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyCtxce9nryccDkWmkyRFlwZMIesRk-ZhHg");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

marked.setOptions({
  highlight: (code, lang) => {
    return hljs.highlight(lang, code).value;
  },
  breaks: true,
  gfm: true,
  tables: true,
  smartLists: true,
  smartypants: true,
  xhtml: true
});

const app = express();

app.use(express.static(path.join(__dirname)));
app.use(express.json());

app.get("/", async (req, res) => {
  const prompt = "create a table for js elements";
  const result = await model.generateContent(prompt);
  const markdown = result.response.text();
  const html = marked(markdown);

  const fullHtml = `
    <html lang="en">
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/default.min.css">
      <link rel="stylesheet" href="/style-server.css">
    </head>
    <body>
      ${html}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
      <script>
        hljs.highlightAll();
      </script>
    </body>
    </html>
  `;
  res.send(fullHtml);
});

app.listen(5000, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('Server started on port 5000');
  }
});