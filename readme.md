# Tasks Tracker

- A simple todo list app built with HTML, CSS and JavaScript for Step8Up Bootcamp Week-4 Assignment. This is a static wweb-page with a template login/signup to showcase css and Crud operations.

## Features

- Sign up / log in before you can see or add tasks
- Add tasks by typing and pressing Enter or clicking Add
- Mark tasks as done with the checkbox
- Edit a task by clicking the pencil icon
- Delete a task by clicking the bin icon
- Tasks are saved per-account in the browser so they survive a page refresh
- Log out from the button next to the stats pills

## Authorisation

This is a static, front-end-only app with no server, so there's nowhere secure
to check a password. Accounts and (hashed) passwords live in the browser's
`localStorage`, keyed by username, and each user's tasks are stored under
their own key so accounts don't see each other's lists.

This is enough to stop someone from casually opening the app and seeing
another user's tasks, but it is **not real security** — anyone with browser
dev tools can read `localStorage` directly. A production app would hash
passwords server-side and issue a proper session token instead.

## File Structure

```
TASKS-TRACKER/
├── index.html   - the page structure (auth screen + app)
├── styles.css   - all the styling
├── auth.js      - sign up / log in / log out logic
├── tasks.js     - task list logic 
└── README.md    - this file
```

## Deployed Site Url

[Website](https://deedaryani.github.io/Step8Up_Week-4/)

## Author

Dee Daryani