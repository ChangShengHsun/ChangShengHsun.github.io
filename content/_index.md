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
      button:
        text: Download CV
        url: uploads/resume.pdf
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

  # # Latest reflections (人生反思)
  # - block: collection
  #   id: reflection
  #   content:
  #     title: Reflection
  #     text: ''
  #     count: 3
  #     filters:
  #       folders:
  #         - reflection
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
      columns: 2

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
