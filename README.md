# ScratchAuther
ScratchアカウントとDiscordアカウントを紐つけることができます。
## Quick Usage

1. Clone

```sh
git clone https://github.com/waki285/ScratchAuther.git
```

2. Edit `config.js`

`verifiedRoles`の部分に認証したあとのロールの配列を指定してください。

3. `npm install`
4. `.env`にtokenを指定

```toml
BOT_TOKEN=Th1sIsN0t4T0k3n.B3cause.1fiShow1tB0tWillB3H4cked
```

5. `npm start`
画面上に `Logged in as ~~~!`と表示されれば起動しています。

6. Discord上で`!scratchauth`
Discordで、認証ボタンを置きたいチャンネル上で`!scratchauth`を送信してください。