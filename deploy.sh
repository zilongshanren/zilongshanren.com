hugo --theme=even --baseUrl="https://zilongshanren.com"
hugo && rsync -avz --delete public/ root@112.124.58.18:/var/www/octopress-cn
