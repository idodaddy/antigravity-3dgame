import { db } from '../firebase';

import { collection, addDoc, query, where, getDocs, updateDoc, doc, limit, orderBy } from "firebase/firestore";

const USERS_COLLECTION = 'users';
const LEADERBOARD_COLLECTION = 'leaderboard';

export const saveUser = async (uuid, nickname) => {
    try {
        const q = query(collection(db, USERS_COLLECTION), where("uuid", "==", uuid));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            await addDoc(collection(db, USERS_COLLECTION), {
                uuid,
                nickname,
                createdAt: new Date()
            });
        } else {
            // User exists, check if nickname is different
            const userDoc = querySnapshot.docs[0];
            if (userDoc.data().nickname !== nickname) {
                await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), { nickname });
            }
        }
    } catch (e) {
        console.error("Error saving user: ", e);
    }
};

export const updateNickname = async (uuid, newNickname) => {
    try {
        // Check uniqueness
        const nickQ = query(collection(db, USERS_COLLECTION), where("nickname", "==", newNickname));
        const nickSnapshot = await getDocs(nickQ);
        if (!nickSnapshot.empty) {
            throw new Error("Nickname already taken");
        }

        const q = query(collection(db, USERS_COLLECTION), where("uuid", "==", uuid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            await updateDoc(doc(db, USERS_COLLECTION, querySnapshot.docs[0].id), {
                nickname: newNickname
            });
            await updateLeaderboardNicknames(uuid, newNickname);
        }
    } catch (e) {
        throw e;
    }
}

const updateLeaderboardNicknames = async (uuid, newNickname) => {
    const q = query(collection(db, LEADERBOARD_COLLECTION), where("uuid", "==", uuid));
    const querySnapshot = await getDocs(q);
    const updates = querySnapshot.docs.map(d => updateDoc(doc(db, LEADERBOARD_COLLECTION, d.id), { nickname: newNickname }));
    await Promise.all(updates);
}

export const getRankForScore = async (gameId, score) => {
    try {
        const q = query(
            collection(db, LEADERBOARD_COLLECTION),
            where("gameId", "==", gameId),
            where("score", ">", score)
        );
        const snapshot = await getDocs(q);
        return snapshot.size + 1;
    } catch (e) {
        console.error("Error calculating rank: ", e);
        return null;
    }
}


export const submitScore = async (gameId, uuid, nickname, score) => {
    try {
        if (score === undefined || score === null) score = 0;
        if (!uuid) return null;

        // Ensure user is 'active' or known
        await saveUser(uuid, nickname);

        await addDoc(collection(db, LEADERBOARD_COLLECTION), {
            gameId,
            uuid,
            nickname,
            score,
            timestamp: new Date()
        });

        // Calculate rank efficiently
        return await getRankForScore(gameId, score);
    } catch (e) {
        console.error("Error adding score: ", e);
        return null;
    }
}

export const getLeaderboard = async (gameId) => {
    try {
        const q = query(
            collection(db, LEADERBOARD_COLLECTION),
            where("gameId", "==", gameId),
            orderBy("score", "desc"),
            limit(100)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting leaderboard: ", e);
        return [];
    }
}
