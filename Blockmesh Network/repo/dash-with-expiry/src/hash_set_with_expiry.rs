use chrono::{DateTime, Utc};
use std::collections::{HashMap, HashSet};
use std::hash::Hash;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct HashSetWithExpiry<K> {
    set: Arc<RwLock<HashSet<K>>>,
    expiry: Arc<RwLock<HashMap<K, DateTime<Utc>>>>,
}

impl<K: Eq + Hash + Clone> Default for HashSetWithExpiry<K> {
    fn default() -> Self {
        Self::new()
    }
}

impl<K: Eq + Hash + Clone> Clone for HashSetWithExpiry<K> {
    fn clone(&self) -> Self {
        Self {
            set: self.set.clone(),
            expiry: self.expiry.clone(),
        }
    }
}

impl<'a, K: Eq + Hash + Clone> HashSetWithExpiry<K> {
    pub fn new() -> Self {
        HashSetWithExpiry {
            set: Arc::new(RwLock::new(HashSet::new())),
            expiry: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn insert(&self, key: K, expiry: Option<DateTime<Utc>>) -> bool {
        match expiry {
            Some(e) => {
                self.expiry.write().await.insert(key.clone(), e);
                self.set.write().await.insert(key)
            }
            None => self.set.write().await.insert(key),
        }
    }

    pub async fn remove(&self, key: &K) -> bool {
        self.expiry.write().await.remove(key);
        self.set.write().await.remove(key)
    }

    async fn _get(&'a self, key: &K) -> Option<K> {
        match self.set.read().await.get(key) {
            Some(value) => {
                let v = value.clone();
                Some(v)
            }
            None => None,
        }
    }

    pub async fn get(&'a self, key: &K) -> Option<K> {
        let e = self.expiry.read().await.get(key).cloned();
        let (v, expired) = match e {
            Some(expiry) => {
                if Utc::now() > expiry {
                    self.set.write().await.remove(key);
                    (None, true)
                } else {
                    (self._get(key).await, false)
                }
            }
            None => (self._get(key).await, false),
        };
        if expired {
            self.expiry.write().await.remove(key);
        }
        v
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::Duration as ChronoDuration;
    use std::time::Duration;
    use tokio::time::sleep;
    use tracing_test::traced_test;

    #[tokio::test]
    #[traced_test]
    async fn no_expiry() {
        let map: HashSetWithExpiry<u64> = HashSetWithExpiry::new();
        map.insert(10, None).await;
        let v = map.get(&10).await.unwrap();
        assert_eq!(10, v);
    }

    #[tokio::test]
    #[traced_test]
    async fn with_expiry() {
        let map: HashSetWithExpiry<u64> = HashSetWithExpiry::new();
        let date = Utc::now() + ChronoDuration::milliseconds(100);
        map.insert(10, Some(date)).await;
        let v = map.get(&10).await.unwrap();
        assert_eq!(10, v);
        let two_sec = Duration::new(2, 0);
        let _ = sleep(two_sec).await;
        let v = map.get(&10).await;
        assert_eq!(None, v);
    }

    #[tokio::test]
    #[traced_test]
    async fn remove() {
        let map: HashSetWithExpiry<u64> = HashSetWithExpiry::new();
        map.insert(10, None).await;
        let v = map.get(&10).await.unwrap();
        assert_eq!(10, v);
        map.remove(&10).await;
        let v = map.get(&10).await;
        assert_eq!(None, v);
    }
}
