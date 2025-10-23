# Contribution Guidelines

Here are some simple guidelines I wrote. If you have questions just message me on Discord (if possible) or just PR and we can discuss there.

## Technical Details

The output generator merges all JSON files from the `docs` folder when creating the output. To prevent merge conflicts, create a file called `{YourUsernameHere}.json` and make your changes there. Follow the JSON schema for format, see `AdamRaichu.json` or `ports.json` for examples.

## Grammar

- Always use the [Oxford Comma](https://en.wikipedia.org/wiki/Serial_comma) where applicable[^1].
- Prefer the American spelling of English words. Don't stress if you forget this; I'll likely just "fix" it later. :D
- Only punctuate complete sentences. There is an example below. Again, this is not an issue if you forget; I'll just fix it later.

```jsonc
{
  "AndEntityData": {
    "o": {
      // No period because this is not a sentence
      "Out": ["Bool", "The result"]
    },
    // There is a period because the comment is a full sentence, with a subject and a verb.
    "c": "This entity returns the logical AND operator applied to all inputs."
  }
}
```

[^1]: The Oxford Comma has been the deciding factor in a federal lawsuit ([source](https://www.lawyersmutualnc.com/blog/missing-oxford-comma-leads-to-million-dollar-recovery)). I know many people have learned it to be optional, but it is of particular importance to me, so please simply use it in this project. :D
