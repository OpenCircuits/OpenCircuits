package api

import (
	"encoding/base64"
	"errors"

	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"github.com/google/uuid"
)

var (
	ErrInvalidID         = errors.New("circuit ID is not valid")
	ErrNotFound          = errors.New("circuit with provided ID not found")
	ErrUserCannotCreate  = errors.New("anon user cannot create")
	ErrInsufficientPerms = errors.New("insufficient permissions")
	ErrThumbnailSize     = errors.New("thumbnail size exceeded capacity")
	ErrContentSize       = errors.New("content size exceeded capacity")
	ErrNameSize          = errors.New("name size exceeded capacity")
	ErrDescSize          = errors.New("description size exceeded capacity")
	ErrVersionSize       = errors.New("version size exceeded capacity")
)

// CircuitHandle contains the logic for the Circuit types.
type CircuitHandle struct {
	db   model.CircuitDB
	user model.UserID
	id   model.CircuitID
	key  model.LinkID

	perms  model.CircuitPermissions
	exists bool
}

func NewCircuitHandle(db model.CircuitDB, user model.UserID, id model.CircuitID, key model.LinkID) CircuitHandle {
	perms, found := db.LoadPermissions(id)
	return CircuitHandle{
		db:   db,
		user: user,
		id:   id,
		key:  key,

		perms:  perms,
		exists: found,
	}
}

func (h *CircuitHandle) reset() {
	h.perms = model.CircuitPermissions{}
	h.exists = false
}

func (h CircuitHandle) AccessLevel() model.AccessLevel {
	if h.perms.Owner == h.user {
		return model.AccessCreator
	} else if h.perms.LinkID == h.key {
		return h.perms.LinkPerm
	} else {
		return model.AccessNone
	}
}

func (h *CircuitHandle) Upsert(c model.Circuit) (model.CircuitID, error) {
	if h.exists {
		if !h.AccessLevel().CanEdit() {
			return 0, ErrInsufficientPerms
		}
	} else {
		if !h.user.CanCreate() {
			return 0, ErrUserCannotCreate
		}
	}

	// Validation
	if len(c.Metadata.Thumbnail) > model.ThumbnailSizeLimit {
		return 0, ErrThumbnailSize
	}
	if len(c.Content) > model.ContentSizeLimit {
		return 0, ErrContentSize
	}
	if len(c.Metadata.Name) > model.NameSizeLimit {
		return 0, ErrNameSize
	}
	if len(c.Metadata.Desc) > model.DescSizeLimit {
		return 0, ErrDescSize
	}
	if len(c.Metadata.Version) > model.VersionSizeLimit {
		return 0, ErrVersionSize
	}

	if h.exists {
		h.db.UpdateCircuit(h.id, c)
		return h.id, nil
	} else {
		h.perms = model.NewCircuitPermissions(h.user)
		h.id = h.db.InsertCircuit(c, h.perms)
		return h.id, nil
	}
}

func (h *CircuitHandle) Load() (model.Circuit, error) {
	if !h.exists {
		return model.Circuit{}, ErrNotFound
	}
	if !h.AccessLevel().CanView() {
		return model.Circuit{}, ErrInsufficientPerms
	}
	if c, found := h.db.LoadCircuit(h.id); found {
		return c, nil
	}
	// Should rarely happen.  Circuit was deleted concurrently.
	h.reset()
	return model.Circuit{}, ErrNotFound
}

func (h *CircuitHandle) Delete() error {
	if !h.exists {
		return ErrNotFound
	}
	if h.AccessLevel().CanDelete() {
		h.db.DeleteCircuit(h.id)
		h.reset()
		return nil
	}
	return ErrInsufficientPerms
}

func (h *CircuitHandle) UpsertLink(level model.AccessLevel, regen bool) (model.CircuitPermissions, error) {
	if !h.exists {
		return model.CircuitPermissions{}, ErrNotFound
	}
	if !h.AccessLevel().CanUpdatePerms() {
		return model.CircuitPermissions{}, ErrInsufficientPerms
	}

	if regen || h.perms.LinkID == "" {
		b, _ := uuid.New().MarshalBinary()
		h.perms.LinkID = model.LinkID(base64.URLEncoding.EncodeToString(b))
	}
	h.perms.LinkPerm = level

	h.db.UpdatePermissions(h.id, h.perms)
	return h.perms, nil
}

func (h *CircuitHandle) LoadLink() (model.CircuitPermissions, error) {
	if !h.exists {
		return model.CircuitPermissions{}, ErrNotFound
	}
	if !h.AccessLevel().CanView() {
		return model.CircuitPermissions{}, ErrInsufficientPerms
	}
	return h.perms, nil
}

func (h *CircuitHandle) DeleteLink() error {
	if !h.exists {
		return ErrNotFound
	}
	if !h.AccessLevel().CanUpdatePerms() {
		return ErrInsufficientPerms
	}
	h.perms.LinkID = ""
	h.perms.LinkPerm = model.AccessNone
	h.db.UpdatePermissions(h.id, h.perms)
	return nil
}
