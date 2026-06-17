import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  onSnapshot,
} from 'firebase/firestore';
import {firestore} from '../../config/firebase';

const COLLECTION = 'notices';
const PAGE_SIZE = 50;

const noticesRef = () => {
  if (!firestore) {
    throw new Error('Firestore is not configured.');
  }
  return collection(firestore, COLLECTION);
};

const toNotice = docSnap => ({
  id: docSnap.id,
  ...docSnap.data(),
  date: docSnap.data().date?.toDate?.().toISOString().slice(0, 10) ?? docSnap.data().date,
  createdAt: docSnap.data().createdAt?.toDate?.().toISOString() ?? null,
});

const noticesService = {
  async getNotices({branchId, category, pageSize = PAGE_SIZE} = {}) {
    try {
      const ref = noticesRef();
      const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
      if (branchId) {
        constraints.unshift(where('branchId', '==', branchId));
      }
      if (category && category !== 'All') {
        constraints.unshift(where('category', '==', category));
      }
      const q = query(ref, ...constraints);
      const snap = await getDocs(q);
      const notices = snap.docs.map(toNotice);
      return notices.sort((a, b) => {
        if (a.pinned === b.pinned) {return 0;}
        return a.pinned ? -1 : 1;
      });
    } catch (err) {
      console.warn('[NoticesService] getNotices failed, returning empty array:', err?.message);
      return [];
    }
  },

  subscribeNotices({branchId, category, onUpdate, onError}) {
    try {
      const ref = noticesRef();
      const constraints = [orderBy('createdAt', 'desc')];
      if (branchId) {
        constraints.push(where('branchId', '==', branchId));
      }
      if (category && category !== 'All') {
        constraints.push(where('category', '==', category));
      }
      const q = query(ref, ...constraints);
      return onSnapshot(q, (snap) => {
        const notices = snap.docs.map(toNotice);
        const sorted = notices.sort((a, b) => {
          if (a.pinned === b.pinned) {return 0;}
          return a.pinned ? -1 : 1;
        });
        onUpdate(sorted);
      }, (err) => {
        console.warn('[NoticesService] Real-time subscription error:', err?.message);
        if (onError) {onError(err);}
      });
    } catch (err) {
      console.error('[NoticesService] Failed to set up subscription:', err);
      if (onError) {onError(err);}
      return () => {};
    }
  },

  async createNotice({title, body, category, branchId, author, authorId, pinned = false}) {
    if (!title?.trim()) {
      throw new Error('Notice title is required.');
    }
    if (!body?.trim()) {
      throw new Error('Notice body is required.');
    }
    const ref = noticesRef();
    const now = Timestamp.now();
    const docRef = await addDoc(ref, {
      title: title.trim(),
      body: body.trim(),
      category: category || 'Academic',
      branchId: branchId || null,
      author: author || 'School',
      authorId: authorId || null,
      pinned: Boolean(pinned),
      readCount: 0,
      date: now.toDate().toISOString().slice(0, 10),
      createdAt: now,
      updatedAt: now,
    });
    return docRef.id;
  },

  async updateNotice(noticeId, updates) {
    if (!noticeId) {
      throw new Error('Notice ID required.');
    }
    if (!firestore) {
      throw new Error('Firestore is not configured.');
    }
    const ref = doc(firestore, COLLECTION, noticeId);
    await updateDoc(ref, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteNotice(noticeId) {
    if (!noticeId) {
      throw new Error('Notice ID required.');
    }
    if (!firestore) {
      throw new Error('Firestore is not configured.');
    }
    const ref = doc(firestore, COLLECTION, noticeId);
    await deleteDoc(ref);
  },

  async togglePin(noticeId, currentPinned) {
    return this.updateNotice(noticeId, {pinned: !currentPinned});
  },
};

export default noticesService;
