---
# Leave the homepage title empty to use the site title
title: ''
date: 2022-10-24
type: landing

sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder/file name within `data/authors/`)
      username: me
      text: ''
    design:
      # Gradient mesh background automatically adapts to the selected theme colors
      background:
        gradient_mesh:
          enable: true
      name:
        size: md
      avatar:
        size: medium
        shape: circle

  # # Latest reading notes (讀書心得)
  # - block: collection
  #   id: reading-notes
  #   content:
  #     title: Reading Notes
  #     text: ''
  #     count: 3
  #     filters:
  #       folders:
  #         - reading-notes
  #   design:
  #     view: article-grid
  #     columns: 3

  # Latest posts (一般心得)
  - block: collection
    id: post
    content:
      title: Posts
      text: ''
      count: 3
      filters:
        folders:
          - post
    design:
      view: article-grid
      columns: 3

  # Selected projects
  - block: collection
    id: projects
    content:
      title: Projects
      text: ''
      filters:
        folders:
          - projects
    design:
      view: article-grid
      columns: 2
---
