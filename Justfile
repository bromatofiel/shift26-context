set shell := ["bash", "-cu"]

# Generic Clever Cloud deployment helper.
_deploy remote branch="main":
  git push -u {{remote}} {{branch}}:main

# Deploy the Mastra service to Clever Cloud.
deploy-mastra branch="main":
  just _deploy clever_bs_mastra {{branch}}

# Deploy all configured services to Clever Cloud.
deploy branch="main": deploy-mastra branch
