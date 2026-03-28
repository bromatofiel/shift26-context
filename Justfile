set shell := ["bash", "-cu"]

# Deploy the Mastra service to Clever Cloud.
deploy-mastra branch="main":
  git fetch origin {{branch}} && git push -f clever_bs_mastra {{branch}}:master