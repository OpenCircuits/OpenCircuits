package gcp_datastore

import (
	"context"
	"errors"
	"fmt"
	"os"

	"cloud.google.com/go/datastore"
	"github.com/OpenCircuits/OpenCircuits/site/go/model"
	"google.golang.org/api/iterator"
	"google.golang.org/api/option"
)

type datastorePermission struct {
	CircuitID model.CircuitID
	UserID    *model.UserID
	LinkID    *model.LinkID
	model.BasePermission
}

func userToDatastore(perm model.UserPermission) datastorePermission {
	return datastorePermission{
		CircuitID:      perm.CircuitID,
		UserID:         &perm.UserID,
		BasePermission: perm.BasePermission,
	}
}

func linkToDatastore(perm model.LinkPermission) datastorePermission {
	return datastorePermission{
		CircuitID:      perm.CircuitID,
		LinkID:         &perm.LinkID,
		BasePermission: perm.BasePermission,
	}
}

func (p datastorePermission) key() string {
	if p.LinkID != nil {
		return p.LinkID.Base64Encode()
	} else {
		return "/" + p.CircuitID.Base64Encode() + "/" + string(*p.UserID)
	}
}

// A GCP cloud datastore interface provider that assumes the GCP DS state is valid for the current version of the
//	application; Migrations may be required and a new "version" field may need to be added
type accessDriver struct {
	dsClient *datastore.Client
	ctx      context.Context
}

func NewAccessDriver(ctx context.Context, ops ...option.ClientOption) (model.AccessDriver, error) {
	projectId := os.Getenv("DATASTORE_PROJECT_ID")
	if projectId == "" {
		return nil, errors.New("DATASTORE_PROJECT_ID environment variable must be set")
	}
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &accessDriver{dsClient: ds, ctx: ctx}, nil
}

// Creates a new GCP datastore instance for use with the local datastore emulator
func NewAccessEmuDriver(ctx context.Context, projectId string, emuHost string, ops ...option.ClientOption) (model.AccessDriver, error) {
	_ = os.Setenv("DATASTORE_EMULATOR_HOST", emuHost)
	ds, err := datastore.NewClient(ctx, projectId, ops...)
	if err != nil {
		return nil, err
	}
	return &accessDriver{dsClient: ds, ctx: ctx}, nil
}

const PERMISSION_KIND = "Permission"

func (d *accessDriver) CircuitPermissions(circuitID model.CircuitID) model.CircuitPermissions {
	query := datastore.NewQuery(PERMISSION_KIND).Filter("CircuitID =", circuitID)
	it := d.dsClient.Run(d.ctx, query)

	permissions := model.NewCircuitPerm(circuitID)
	for {
		var perm datastorePermission
		_, err := it.Next(&perm)
		if err == iterator.Done {
			break
		} else if err != nil {
			panic(err)
		}

		if perm.UserID != nil {
			permissions.UserPerms[*perm.UserID] = model.UserPermission{
				CircuitID:      circuitID,
				UserID:         *perm.UserID,
				BasePermission: perm.BasePermission,
			}
		} else if perm.LinkID != nil {
			permissions.LinkPerms[*perm.LinkID] = model.LinkPermission{
				CircuitID:      circuitID,
				LinkID:         *perm.LinkID,
				BasePermission: perm.BasePermission,
			}
		} else {
			fmt.Printf("Circuit (id=%s) had empty permission entry\n", circuitID)
		}
	}
	return permissions
}

func (d *accessDriver) UserPermission(circuitID model.CircuitID, userID model.UserID) model.UserPermission {
	query := datastore.NewQuery(PERMISSION_KIND).Filter("CircuitID =", circuitID).Filter("UserID =", userID)
	it := d.dsClient.Run(d.ctx, query)

	var perm datastorePermission
	_, err := it.Next(&perm)
	if err == iterator.Done {
		return model.NewNoAccessPermission(circuitID, userID)
	} else if err != nil {
		panic(err)
	}

	return model.UserPermission{
		CircuitID:      circuitID,
		UserID:         userID,
		BasePermission: perm.BasePermission,
	}
}

func (d *accessDriver) LinkPermission(linkID model.LinkID) (model.LinkPermission, bool) {
	query := datastore.NewQuery(PERMISSION_KIND).Filter("LinkID =", linkID)
	it := d.dsClient.Run(d.ctx, query)

	var perm datastorePermission
	_, err := it.Next(&perm)
	if err == iterator.Done {
		return model.LinkPermission{}, false
	} else if err != nil {
		panic(err)
	}

	return model.LinkPermission{
		CircuitID:      perm.CircuitID,
		LinkID:         linkID,
		BasePermission: perm.BasePermission,
	}, true
}

func (d *accessDriver) UserPermissions(userID model.UserID) model.AllUserPermissions {
	query := datastore.NewQuery(PERMISSION_KIND).Filter("UserID =", userID)
	it := d.dsClient.Run(d.ctx, query)

	permissions := make(model.AllUserPermissions)
	for {
		var perm datastorePermission
		_, err := it.Next(&perm)
		if err == iterator.Done {
			break
		} else if err != nil {
			panic(err)
		}

		permissions[perm.CircuitID] = model.UserPermission{
			CircuitID:      perm.CircuitID,
			UserID:         userID,
			BasePermission: perm.BasePermission,
		}
	}
	return permissions
}

func (d *accessDriver) UpsertUserPermission(perm model.UserPermission) {
	dsPerm := userToDatastore(perm)
	key := datastore.NameKey(PERMISSION_KIND, dsPerm.key(), nil)
	d.dsClient.Put(d.ctx, key, dsPerm)
}

func (d *accessDriver) UpsertLinkPermission(perm model.LinkPermission) {
	dsPerm := linkToDatastore(perm)
	key := datastore.NameKey(PERMISSION_KIND, dsPerm.key(), nil)
	d.dsClient.Put(d.ctx, key, dsPerm)
}

func (d *accessDriver) DeleteCircuitPermissions(circuitID model.CircuitID) {
	query := datastore.NewQuery(PERMISSION_KIND).Filter("CircuitID =", circuitID).KeysOnly()
	it := d.dsClient.Run(d.ctx, query)

	var keys []*datastore.Key
	for {
		key, err := it.Next(nil)
		if err == iterator.Done {
			break
		} else if err != nil {
			panic(err)
		}
		keys = append(keys, key)
	}

	if err := d.dsClient.DeleteMulti(d.ctx, keys); err != nil {
		panic(err)
	}
}

func (d *accessDriver) DeleteUserPermission(circuitID model.CircuitID, userID model.UserID) {
	query := datastore.NewQuery(PERMISSION_KIND).Filter("CircuitID =", circuitID).Filter("UserID =", userID).KeysOnly()
	it := d.dsClient.Run(d.ctx, query)

	var keys []*datastore.Key
	for {
		key, err := it.Next(nil)
		if err == iterator.Done {
			break
		} else if err != nil {
			panic(err)
		}
		keys = append(keys, key)
	}

	if err := d.dsClient.DeleteMulti(d.ctx, keys); err != nil {
		panic(err)
	}
}

func (d *accessDriver) DeleteLinkPermission(linkID model.LinkID) {
	key := datastore.NameKey(PERMISSION_KIND, linkID.Base64Encode(), nil)
	if err := d.dsClient.Delete(d.ctx, key); err != nil {
		panic(err)
	}
}
