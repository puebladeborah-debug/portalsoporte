'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  collection, doc, addDoc, updateDoc, deleteDoc, setDoc,
  onSnapshot, query, orderBy as fsOrderBy, where as fsWhere,
  QueryConstraint, WhereFilterOp,
} from 'firebase/firestore'
import { db } from './firebase'

type WhereClause = [string, WhereFilterOp, unknown]

// Hook genérico: se suscribe en tiempo real a una colección de Firestore
// y expone funciones para crear, actualizar y eliminar documentos.
// Cualquier cambio que haga cualquier persona del equipo se refleja al instante
// en todos los dispositivos conectados (sin necesidad de refrescar ni de polling).
export function useFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  options?: { where?: WhereClause; orderByField?: string },
) {
  const { where: whereClause, orderByField } = options ?? {}
  const whereKey = whereClause ? JSON.stringify(whereClause) : ''

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const constraints: QueryConstraint[] = []
    if (whereClause) constraints.push(fsWhere(whereClause[0], whereClause[1], whereClause[2]))
    if (orderByField) constraints.push(fsOrderBy(orderByField))
    const q = query(collection(db, collectionName), ...constraints)
    const unsub = onSnapshot(q, snap => {
      setData(snap.docs.map(d => ({ id: d.id, ...d.data() } as T)))
      setLoading(false)
    }, () => setLoading(false))
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, whereKey, orderByField])

  const add = useCallback(async (item: Omit<T, 'id'>) => {
    const ref = await addDoc(collection(db, collectionName), item as Record<string, unknown>)
    return ref.id
  }, [collectionName])

  const set = useCallback(async (id: string, item: Omit<T, 'id'>) => {
    await setDoc(doc(db, collectionName, id), item as Record<string, unknown>)
  }, [collectionName])

  const update = useCallback(async (id: string, item: Partial<T>) => {
    await updateDoc(doc(db, collectionName, id), item as Record<string, unknown>)
  }, [collectionName])

  const remove = useCallback(async (id: string) => {
    await deleteDoc(doc(db, collectionName, id))
  }, [collectionName])

  return { data, loading, add, set, update, remove }
}

// Hook para un único documento "config" (ej. el patrón semanal de guardias).
export function useFirestoreDoc<T>(collectionName: string, docId: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ref = doc(db, collectionName, docId)
    const unsub = onSnapshot(ref, snap => {
      setData(snap.exists() ? (snap.data() as T) : defaultValue)
      setLoading(false)
    }, () => setLoading(false))
    return unsub
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, docId])

  const save = useCallback(async (value: T) => {
    await setDoc(doc(db, collectionName, docId), value as Record<string, unknown>)
  }, [collectionName, docId])

  return { data, loading, save }
}
