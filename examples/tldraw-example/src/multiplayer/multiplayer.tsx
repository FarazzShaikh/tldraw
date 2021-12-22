/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as React from 'react'
import { TDShape, Tldraw } from '@tldraw/tldraw'
import { createClient } from '@liveblocks/client'
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react'
import { useMultiplayerState } from './useMultiplayerState'
import { initializeApp } from 'firebase/app'
import firebaseConfig from '../firebase.config'
import { useEffect } from 'react'
import { useMemo } from 'react'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'

const client = createClient({
  // @ts-ignore
  publicApiKey: process.env.LIVEBLOCKS_PUBLIC_API_KEY || '',
  throttle: 100,
})

const roomId = 'mp-test-8'

export function Multiplayer() {
  return (
    <LiveblocksProvider client={client}>
      <RoomProvider id={roomId}>
        <Editor roomId={roomId} />
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function Editor({ roomId }: { roomId: string }) {
  const { error, ...events } = useMultiplayerState(roomId)
  const app = useMemo(() => initializeApp(firebaseConfig), [firebaseConfig])
  const storage = useMemo(() => getStorage(app, firebaseConfig.storageBucket), [])

  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="tldraw">
      <Tldraw
        showPages={false}
        {...events}
        onImageUpload={async (file: File, id: string) => {
          const imageRef = ref(storage, id)
          const snapshot = await uploadBytes(imageRef, file)
          const url = await getDownloadURL(snapshot.ref)
          return url
        }}
        onImageDelete={async (id: string) => {
          console.log(id)
          const imageRef = ref(storage, id)
          await deleteObject(imageRef)
        }}
      />
    </div>
  )
}
