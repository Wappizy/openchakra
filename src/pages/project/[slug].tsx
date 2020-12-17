import React, { useEffect, useState } from 'react'
import { GetStaticProps, GetStaticPaths, InferGetStaticPropsType } from 'next'
import { getSession, signIn } from 'next-auth/client'
import useDispatch from '~hooks/useDispatch'
import EditorPage from '~pages/editor'
import prisma from '../../utils/prisma'

export const getStaticProps: GetStaticProps = async ({ params }) => {
  let projectId = (params!.slug as string).split('-')[0]
  let projectName = (params!.slug as string).split('-')[1]

  const project = await prisma.project.findOne({
    include: { user: true },
    where: {
      id: Number(projectId),
    },
  })
  let projects = JSON.parse(JSON.stringify(project))
  return {
    props: {
      projects,
      id: Number(projectId),
      projectName: projectName,
      public: project?.public,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await prisma.project.findMany()
  return {
    paths: projects.map(project => ({
      params: {
        slug: `${project.id.toString()}-${project.projectName.toString()}`,
      },
    })),
    fallback: false,
  }
}

const ProjectSlug = ({
  projects,
  id,
  projectName,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [loading, setLoading] = useState(true)
  const [projectExist, setProjectExist] = useState(true)

  const dispatch = useDispatch()

  const checkSession = async () => {
    const session = await getSession()
    if (session) {
      if (projects) {
        setProjectExist(true)
        if (projects.markup) {
          dispatch.components.reset(JSON.parse(projects.markup))
          setLoading(false)
        }
      } else {
        setProjectExist(false)
      }
    } else {
      signIn('github', {
        callbackUrl: process.env.NEXTAUTH_URL as string,
      })
    }
  }

  useEffect(() => {
    checkSession()
    // eslint-disable-next-line
  }, [])

  return (
    <EditorPage
      id={id}
      loading={loading}
      projectExist={projectExist}
      projectName={projectName}
      validated={projects.validated}
      public={projects.public}
    />
  )
}

export default ProjectSlug
