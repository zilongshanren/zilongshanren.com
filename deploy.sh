# hugo --theme=even --baseUrl="https://zilongshanren.com"
# hugo && rsync -avz --delete public/ root@txyun:/var/www/octopress-cn
cp docs/CNAME public
rm -rf docs
cp -r public docs
