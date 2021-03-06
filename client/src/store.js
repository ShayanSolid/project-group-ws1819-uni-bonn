import Vue from 'vue'
import Vuex from 'vuex'
import postJson from './mixins/postJson'


Vue.use(Vuex)

function reduceToObject(array) {
    return array.reduce(function (map, obj) {
        map[obj._id] = obj
        return map;
    }, {})
}

export default new Vuex.Store({
    state: {
        gallery: {
            images: {},
        },
        savedTags: [],
        user: null,
    },
    mutations: {
        receiveImages(state, payload) {
            state.gallery.images = payload.images
        },
        receiveTags(state, payload) {
            state.savedTags = payload.map(tag => tag.name)
        },
        receiveUser(state, user) {
            state.user = user
        },
        clearUser(state) {
            state.user = null
        },
    },
    actions: {
        fetchImages(context) {
            postJson('/getImageJson', {}).then(json => {
                context.commit('receiveImages', {images: reduceToObject(json.images)})
            })
        },
        fetchTags(context) {
            postJson('/getTags', {}).then(json => {
                context.commit('receiveTags', json)
            })
        },
    },
    getters: {
        tags: state => {
            return state.savedTags
        },
        metadata: state => id => {
            const image = state.gallery.images[id]
            return image ? {path: image.path, label: image.label} : {path: '', label: ''}
        },
        image: state => id => {
            return state.gallery.images[id]
        },
        // TODO: only call this when page is loaded with an id, otherwise index can be known without expensive indexOf
        adjacentId: state => (id, direction) => {
            const maxIndex = Object.keys(state.gallery.images).length - 1
            const images = Object.keys(state.gallery.images)
            const currentIndex = images.indexOf(id)
            let newIndex = currentIndex
            if (direction === 1) {
                newIndex = currentIndex === maxIndex ? 0 : currentIndex + 1
            } else if (direction === -1) {
                newIndex = currentIndex === 0 ? maxIndex : currentIndex - 1
            }
            return images[newIndex]
        },
        user: state => {
            return state.user
        },
    },
})
