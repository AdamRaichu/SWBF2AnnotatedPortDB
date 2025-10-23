import os
from mwcleric.wikigg_client import WikiggClient
from mwcleric.auth_credentials import AuthCredentials
from mwcleric.page_modifier import PageModifierBase

credentials = AuthCredentials(
    username="AdamRaichuGitHubBot@AdamRaichu/SWBF2AnnotatedPortDB",
    password=os.getenv("BOT_PASSWORD"),
)
site = WikiggClient(wiki="swbf2frosty", credentials=credentials)
summary = "Update generated port database"

port_data = ""
preamble = (
    "// Machine generated, see https://github.com/AdamRaichu/SWBF2AnnotatedPortDB\n"
)

with open("generated/ports.min.json", "r", encoding="utf-8") as f:
    port_data = f.read()


class PageModifier(PageModifierBase):
    def update_plaintext(self, text):
        # modify "text" and return the new content
        return preamble + port_data


# Target a single page by title
PageModifier(
    site,
    title_list=["MediaWiki:Gadgets/calculator-page-operations/portlist defs.js"],
    summary=summary,
).run()
